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
	lookup: {
		container: () => 'flex',
		direction: (_name, value) => (value ? `flex-${value.replace(/column/, 'col')}` : ''),
		// item: '',
		lg: calculateWidth,
		md: calculateWidth,
		sm: calculateWidth,
		xl: calculateWidth,
		xs: calculateWidth,
		spacing: 'grap',
		wrap: 'flex',
		zeroMinWidth: (_name, value) => (value === 'true' ? 'min-w-0' : ''),
		alignContent: 'content',
		alignItems: 'items',
		bgcolor: 'bg',
		border: 'border',
		borderBottom: 'border-b',
		borderColor: 'border',
		borderLeft: 'border-l',
		borderRadius: 'rounded',
		borderRight: 'border-r',
		borderTop: 'border-t',
		bottom: 'bottom',
		boxShadow: 'shadow',
		color: 'text',
		display: (_, value) => value ?? '',
		flex: 'flex',
		flexDirection: (_name, value) => (value ? `flex-${value.replace(/column/, 'col')}` : ''),
		flexGrow: 'flex-grow',
		fontSize: 'text',
		fontStyle: (_, value) => value ?? '',
		fontWeight: 'font',
		gridGap: 'gap',
		gridTemplateRows: 'grid-rows',
		height: 'h',
		justifyContent: 'justify',
		left: 'left',
		m: 'm',
		margin: 'm',
		marginBottom: 'mb',
		marginLeft: 'ml',
		marginRight: 'mr',
		marginTop: 'mt',
		marginX: 'mx',
		marginY: 'my',
		maxWidth: 'max-w',
		mb: 'mb',
		minHeight: 'min-h',
		minWidth: 'min-w',
		ml: 'ml',
		mr: 'mr',
		mt: 'mt',
		mx: 'mx',
		my: 'my',
		overflow: 'oerflow',
		p: 'p',
		padding: 'p',
		paddingBottom: 'pb',
		paddingLeft: 'pl',
		paddingX: 'px',
		paddingY: 'py',
		pb: 'pb',
		pl: 'pl',
		position: (_, value) => value ?? '',
		pr: 'pr',
		pt: 'pt',
		px: 'px',
		py: 'py',
		right: 'right',
		textAlign: 'text',
		top: 'top',
		whiteSpace: 'whitespace',
		width: 'w',
		zIndex: 'z',
	},
});
