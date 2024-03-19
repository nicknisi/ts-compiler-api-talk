import Converter from '../Converter.js';

const calculateWidth = (prefix: string, value: string | undefined) => {
	if (!value) {
		return '';
	}

	const number = Number(value);

	if (isNaN(number)) {
		if (value === 'auto') {
			return `${prefix}:flex-auto`;
		} else if (value === 'true') {
			return `${prefix}:flex-grow`;
		}
	}

	return `${prefix}:${number}/12`;
};

export default Converter.createConverter({
	baseClasses: ['border-box'],
	lookup: {
		alignContent: 'content',
		alignItems: 'items',
		container: () => 'flex flex-wrap',
		direction: (_name, value) => (value ? `flex-${value.replace(/column/, 'col')}` : ''),
		item: 'flex-auto box-border',
		justify: 'justify',
		justifyContent: 'justify',
		lg: calculateWidth,
		md: calculateWidth,
		sm: calculateWidth,
		xl: calculateWidth,
		xs: calculateWidth,
		spacing: 'gap',
		wrap: 'flex-wrap',
		zeroMinWidth: (_name, value) => (value === 'true' ? 'min-w-0' : ''),
		color: 'text',
	},
});
