import { Box, Grid, Link } from '@material-ui/core';
import { useTranslation } from 'react-i18next';

export default function Copyright() {
	const { t } = useTranslation();
	const year = new Date().getFullYear();
	return (
		<Box m={4}>
			<Grid container spacing={1} justify="center">
				<Grid item>
					<Link color="inherit" href="https://nicknisi.com">
						{t('core.copyright')}
					</Link>
				</Grid>
				<Grid item>{year}</Grid>
			</Grid>
		</Box>
	);
}
