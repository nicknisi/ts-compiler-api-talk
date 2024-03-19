import { JsxElement, JsxSelfClosingElement, SyntaxKind, CodeBlockWriter } from 'ts-morph';
import Prop, { PropTransform } from './Prop.js';
import { getAttributeByName, getOpeningElement, getValueFromExpression, purgeMap } from './utils.js';

export type PropLookup = {
	[key: string]: PropTransform;
};

interface CreateConverterOptions {
	lookup: PropLookup;
	baseClasses?: string[];
}

export abstract class Converter {
	/**
	 * Create a Converter class with a given prop lookup
	 */
	static createConverter({ baseClasses = [], lookup }: CreateConverterOptions) {
		return class extends Converter {
			baseClasses = baseClasses;
			lookup = lookup;
			constructor(element: JsxElement | JsxSelfClosingElement) {
				super(element);
				this.process();
			}
		};
	}

	/**
	 * The base attributes that can be found on components and should be copied over, verbatim to the new component.
	 */
	static readonly baseAttributes = [
		// 'className',
		// 'component',
		'data-intercom-target',
		'data-testid',
		// 'item',
		'key',
		'onClick',
		'onKeyUp',
		'onMouseEnter',
		'onMouseLeave',
		'ref',
		'role',
		'style',
		'tabIndex',
		'unselectable',
	] as const;

	/**
	 * The base classes that should be added to every component that is converted
	 */
	abstract lookup: PropLookup;

	/**
	 * The list of properties identified on the element
	 */
	private props: Prop[] = [];

	/**
	 * A list of base classes that should be added to every component that is converted
	 */
	protected readonly baseClasses: string[] = [];

	/**
	 * The type of replacement component
	 */
	private component = 'div';

	// This class is responsible for:
	// - creating Prop objects
	// - Creating a className string from the props and stringing them together

	constructor(
		public element: JsxElement | JsxSelfClosingElement,
		private complexClassWrapper = 'cn',
	) {}

	/**
	 * Convert the element into a list of props.
	 * @important This method must be called before any other methods.
	 */
	protected process(): void {
		const { element, lookup } = this;
		const allowedKeys = Object.keys(lookup);
		const openingElement = getOpeningElement(element);
		this.props = purgeMap(allowedKeys, name => {
			const attribute = openingElement.getAttribute(name)?.asKind(SyntaxKind.JsxAttribute);
			const transform = lookup[name]!;
			if (attribute) {
				return new Prop(attribute, transform);
			}
		});

		this.setComponentType();
	}

	/**
	 * Set the component type that the new element should be
	 * This is the `component` property, if provided, or it defaults to a `<div/>`
	 */
	private setComponentType() {
		const component = getOpeningElement(this.element).getAttribute('component');

		if (component) {
			const initializer = component.asKind(SyntaxKind.JsxAttribute)?.getInitializer();

			if (initializer && initializer.isKind(SyntaxKind.StringLiteral)) {
				this.component = initializer.getLiteralValue();
			} else if (initializer && initializer.isKind(SyntaxKind.JsxExpression)) {
				this.component = initializer.getExpression()?.getText() ?? this.component;
			}
		}
	}

	/**
	 * Check if the element is self-closing
	 */
	isSelfClosing(): boolean {
		return this.element.isKind(SyntaxKind.JsxSelfClosingElement);
	}

	/**
	 * Check if the class is complex, meaning that it contains expressions that need to be evaulated
	 */
	isComplexClass(): boolean {
		const className = getAttributeByName(this.element, 'className');
		return !!className || this.props.some(prop => prop.isComplexClass);
	}

	/**
	 * Get the transformed Tailwind string that will be provided to the className of the tailwind component.
	 * This could be a list of space-separated strings or it could be comma seperated literals/expressions
	 */
	getClassString(): string {
		const { props, element } = this;
		const className = getAttributeByName(element, 'className');
		const isComplexClass = this.isComplexClass();

		if (!isComplexClass) {
			const classString = [...this.baseClasses, ...props.map(p => p.tailwindClass)].join(' ');
			return classString && `"${classString}"`;
		} else {
			const values = props.map(p => (p.isComplexClass ? p.tailwindClass : `"${p.tailwindClass}"`));

			const classNameValue = className && getValueFromExpression(className.getInitializer()!);
			if (classNameValue) {
				values.push(
					className.getInitializer()?.isKind(SyntaxKind.StringLiteral) ? `"${classNameValue}"` : classNameValue,
				);
			}

			this.baseClasses.forEach(baseClass => values.unshift(`"${baseClass}"`));

			return values.join(', ');
		}
	}

	/**
	 * Set any additional props that need to be set on the component
	 * This could include things like key, data-testid, etc.
	 */
	getAdditionalProps(): Array<{ name: string; initializer: string | undefined }> {
		// TODO: implement this
		const openingElement = getOpeningElement(this.element);
		const additionalProps = purgeMap(Converter.baseAttributes, attr => {
			const prop = openingElement.getAttribute(attr)?.asKind(SyntaxKind.JsxAttribute);
			return (
				prop && {
					name: prop.getNameNode().getText(),
					initializer: prop.getInitializer()?.getText(),
				}
			);
		});

		return additionalProps;
	}

	/**
	 * Convert the element into a new element string with the appropriate classes and props
	 * @returns The new element string
	 */
	convert(): string {
		const { element } = this;
		const isComplexClass = this.isComplexClass();
		const writer = new CodeBlockWriter();
		const classString = this.getClassString();

		writer.write(`<${this.component}`);

		if (classString) {
			if (isComplexClass) {
				writer.write(` className={${this.complexClassWrapper}(${this.getClassString()})}`);
			} else {
				writer.write(` className=${this.getClassString()}`);
			}
		}

		this.getAdditionalProps().forEach(prop => {
			if (prop.initializer) {
				writer.write(` ${prop.name}=${prop.initializer}`);
			} else {
				writer.write(` ${prop.name}`);
			}
		});

		this.element.getDescendantsOfKind(SyntaxKind.JsxSpreadAttribute).forEach(spread => {
			const text = spread.getExpression().getText();
			writer.write(` {...${text}}`);
		});

		writer.write(element.isKind(SyntaxKind.JsxSelfClosingElement) ? ' />' : '>');

		return writer.toString();
	}
}

export default Converter;
