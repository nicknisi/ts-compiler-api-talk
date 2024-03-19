import { Box, Grid } from '@material-ui/core';
import { useTranslation } from 'react-i18next';

export default function Copyright() {
	const { t } = useTranslation();
	const year = new Date().getFullYear();
	return (
		<Box m={4}>
			<Grid container spacing={1}>
				<Grid item>
					<a href="https://nicknisi.com">{t('core.copyright')}</a>
				</Grid>
				<Grid item>{year}</Grid>
			</Grid>
		</Box>
	);
}
