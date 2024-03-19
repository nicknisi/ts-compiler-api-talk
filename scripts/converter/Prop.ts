import { ConditionalExpression, JsxAttribute, SyntaxKind } from 'ts-morph';
import { getProperties, getValueFromExpression, isArbitraryValue } from './utils.js';

export type Props = Array<[string, string | undefined, string | undefined]>;

export type ObjectLiteralValue = Record<string, string | undefined>;

export type PropTransform = string | ((name: string, value: string | undefined, isArbitrary?: boolean) => string);

export class Prop {
	name: string;
	isComplexClass: boolean = false;
	tailwindClass: string;

	constructor(
		protected attribute: JsxAttribute,
		protected transform: PropTransform,
	) {
		this.name = this.getName();
		this.tailwindClass = this.convert();
		// this.isComplexClass = Array.isArray(this.value);
	}

	protected getName() {
		return this.attribute.getNameNode().getText();
	}

	protected transformConditionalExpression(expression: ConditionalExpression) {
		const condition = expression.getCondition();
		const whenTrue = expression.getWhenTrue();
		const whenFalse = expression.getWhenFalse();
		let value: string = `${condition.getText()} ? `;

		if (whenTrue.isKind(SyntaxKind.ConditionalExpression)) {
			value += this.transformConditionalExpression(whenTrue);
		} else {
			value += `'${this.runTransform(getValueFromExpression(whenTrue))}'`;
		}

		value += ` : `;

		if (whenFalse.isKind(SyntaxKind.ConditionalExpression)) {
			value += this.transformConditionalExpression(whenFalse);
		} else {
			value += `'${this.runTransform(getValueFromExpression(whenFalse))}'`;
		}

		return value;
	}

	protected runTransform(value: string | undefined) {
		const { transform, name } = this;
		const isArbitrary = isArbitraryValue(value || '');
		if (typeof transform === 'function') {
			return transform(name, value, isArbitrary);
		}

		if (!value) {
			return transform;
		}

		return `${transform}-${isArbitrary ? `[${value}]` : value}`;
	}

	/**
	 * Converts the prop to a tailwind class.
	 */
	convert() {
		const { attribute } = this;
		let twClass: string = '';
		const initializer = attribute.getInitializer();

		if (!initializer) {
			// this is a boolean prop
			twClass = this.runTransform(undefined);
		} else if (initializer?.isKind(SyntaxKind.StringLiteral)) {
			twClass = this.runTransform(initializer.getLiteralValue());
		} else if (initializer?.isKind(SyntaxKind.JsxExpression)) {
			const expression = initializer.getExpression();

			if (expression?.isKind(SyntaxKind.ObjectLiteralExpression)) {
				twClass = Object.entries(getProperties(expression))
					.map(([key, value]) => `${key}:${this.runTransform(value)}`)
					.join(' ');
			} else if (expression?.isKind(SyntaxKind.ConditionalExpression)) {
				this.isComplexClass = true;
				twClass = this.transformConditionalExpression(expression);
			} else {
				twClass = this.runTransform(expression?.getText());
			}
		}

		return twClass;
	}
}

export default Prop;
