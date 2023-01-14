import type { StyleRule } from "@vanilla-extract/css";

type DataAttribute<TState extends string> = `[data-${TState}]`;

type CSSProps = Omit<StyleRule, "selectors" | "@media" | "@supports">;

type SelectorOptions = {
  parentSelector?: string;
  not?: boolean;
};

function makeDataAttribute<TState extends string>(state: TState): DataAttribute<TState> {
  return `[data-${state}]` as const;
}

function makeSelectorByOptions(selector: string, options: SelectorOptions): string {
  if (options.not) {
    selector = `:not(${selector})`;
  }

  selector = `&${selector}`;

  if (options.parentSelector) {
    selector = `${options.parentSelector} ${selector}`;
  }

  return selector;
}

type DataAttributeStates =
  | "valid"
  | "invalid"
  | "required"
  | "disabled"
  | "readonly"
  | "checked"
  | "indeterminate"
  | "selected"
  | "pressed"
  | "expanded"
  | "hover"
  | "focus"
  | "focus-visible"
  | "active";

type DataAttributeStyles = {
  [key in DataAttributeStates]?: CSSProps & { not?: CSSProps };
};

type CompoonentStateStyleOptions = {
  /**
   * Apply a parent selector to the given selector
   */
  parentSelector?: string;
};

export function componentStateStyles(
  styles: DataAttributeStyles,
  options?: CompoonentStateStyleOptions
): StyleRule {
  const styleRule = { selectors: {} } as { selectors: StyleRule["selectors"] };

  const selectorOptions: SelectorOptions = {
    parentSelector: options?.parentSelector ?? undefined,
  };

  if (styleRule.selectors) {
    for (const property in styles) {
      const { not, ...styleValues } = styles[property as DataAttributeStates] ?? {};
      const dataAttrSelector = makeDataAttribute(property);

      if (not) {
        const selector = makeSelectorByOptions(dataAttrSelector, {
          parentSelector: selectorOptions.parentSelector,
          not: true,
        });
        styleRule.selectors[selector] = not || {};
      }

      const selector = makeSelectorByOptions(dataAttrSelector, {
        parentSelector: selectorOptions.parentSelector,
        not: false,
      });

      styleRule.selectors[selector] = styleValues;
    }
  }
  return styleRule;
}
