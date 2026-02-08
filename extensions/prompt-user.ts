/**
 * Prompt User Tool — gives the LLM a friendly way to ask the user questions.
 *
 * Three interaction types:
 *   - select:  pick from a list of options (with optional "other" free text)
 *   - confirm: yes/no question
 *   - input:   free text input with optional placeholder
 *
 * Usage by the LLM:
 *   prompt_user({ question: "Which database?", type: "select", options: ["PostgreSQL", "SQLite"] })
 *   prompt_user({ question: "Delete the file?", type: "confirm" })
 *   prompt_user({ question: "What should the title be?", type: "input", placeholder: "My Project" })
 */

import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";
import { StringEnum } from "@mariozechner/pi-ai";
import { Text } from "@mariozechner/pi-tui";
import { Type } from "@sinclair/typebox";

interface PromptUserDetails {
	question: string;
	type: "select" | "confirm" | "input";
	options?: string[];
	answer: string | null;
	cancelled: boolean;
}

const PromptUserParams = Type.Object({
	question: Type.String({ description: "The question to ask the user" }),
	type: StringEnum(["select", "confirm", "input"] as const, {
		description: "Interaction type: select (pick from options), confirm (yes/no), or input (free text)",
	}),
	options: Type.Optional(
		Type.Array(Type.String(), {
			description: "Choices for select type. Ignored for confirm and input.",
		}),
	),
	placeholder: Type.Optional(
		Type.String({
			description: "Placeholder/default value for input type. Ignored for select and confirm.",
		}),
	),
});

export default function promptUser(pi: ExtensionAPI) {
	pi.registerTool({
		name: "prompt_user",
		label: "Prompt User",
		description:
			"Ask the user a question and wait for their response. Use this when you need clarification, a choice between options, or confirmation before proceeding. Types: 'select' (pick from options), 'confirm' (yes/no), 'input' (free text).",
		parameters: PromptUserParams,

		async execute(_toolCallId, params, _signal, _onUpdate, ctx) {
			if (!ctx.hasUI) {
				return {
					content: [{ type: "text", text: "Error: no UI available (non-interactive mode)" }],
					details: {
						question: params.question,
						type: params.type,
						options: params.options,
						answer: null,
						cancelled: true,
					} as PromptUserDetails,
				};
			}

			let answer: string | null = null;
			let cancelled = false;

			switch (params.type) {
				case "select": {
					const options = params.options ?? [];
					if (options.length === 0) {
						return {
							content: [{ type: "text", text: "Error: 'select' type requires options array" }],
							details: {
								question: params.question,
								type: "select",
								options: [],
								answer: null,
								cancelled: true,
							} as PromptUserDetails,
						};
					}

					const result = await ctx.ui.select(params.question, options);
					if (result === undefined) {
						cancelled = true;
					} else {
						answer = result;
					}
					break;
				}

				case "confirm": {
					const result = await ctx.ui.confirm("Question", params.question);
					answer = result ? "yes" : "no";
					break;
				}

				case "input": {
					const result = await ctx.ui.input(params.question, params.placeholder ?? "");
					if (result === undefined) {
						cancelled = true;
					} else {
						answer = result;
					}
					break;
				}
			}

			const details: PromptUserDetails = {
				question: params.question,
				type: params.type,
				options: params.options,
				answer,
				cancelled,
			};

			if (cancelled) {
				return {
					content: [{ type: "text", text: "User cancelled / dismissed the prompt" }],
					details,
				};
			}

			return {
				content: [{ type: "text", text: `User responded: ${answer}` }],
				details,
			};
		},

		renderCall(args, theme) {
			const typeLabel = theme.fg("muted", `[${args.type}]`);
			let text = theme.fg("toolTitle", theme.bold("prompt_user ")) + typeLabel + " " + theme.fg("text", args.question);

			if (args.type === "select" && Array.isArray(args.options) && args.options.length > 0) {
				text += "\n" + theme.fg("dim", `  Options: ${args.options.join(", ")}`);
			}

			return new Text(text, 0, 0);
		},

		renderResult(result, _options, theme) {
			const details = result.details as PromptUserDetails | undefined;

			if (!details) {
				const text = result.content[0];
				return new Text(text?.type === "text" ? text.text : "", 0, 0);
			}

			if (details.cancelled) {
				return new Text(theme.fg("warning", "✗ Cancelled"), 0, 0);
			}

			const icon = theme.fg("success", "✓ ");

			switch (details.type) {
				case "confirm":
					return new Text(icon + theme.fg("accent", details.answer === "yes" ? "Yes" : "No"), 0, 0);
				case "select":
					return new Text(icon + theme.fg("accent", details.answer ?? ""), 0, 0);
				case "input":
					return new Text(icon + theme.fg("muted", '"') + theme.fg("accent", details.answer ?? "") + theme.fg("muted", '"'), 0, 0);
				default:
					return new Text(icon + theme.fg("text", details.answer ?? ""), 0, 0);
			}
		},
	});
}
