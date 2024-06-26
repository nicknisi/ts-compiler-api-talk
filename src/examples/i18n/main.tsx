import { useTranslation } from 'react-i18next';

export default function Main() {
	const { t } = useTranslation();

	return (
		<div>
			<h1>My App</h1>
			<p>{t('Hello, World!')}</p>
		</div>
	);
}
