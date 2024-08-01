export const callback = `const useStyles = makeStyles(({ spacing, breakpoints }) => ({
  header: {
    marginTop: spacing(3),
    [breakpoints.up('md')]: {
      padding: spacing(0, 3),
    },
  },
  title: {
    marginBottom: spacing(0.5),
  },
  subtitle: {
    fontWeight: 'normal',
    fontSize: '20px',
    marginBottom: spacing(0.5),
    marginTop: spacing(0.5),
  },
}));`;

export const objectLiteral = `const useStyles = makeStyles({
  container: {
    display: 'flex',
    justifyContent: 'center',
  },
});`;

export const createStylesCall = `const useStyles = makeStyles(({ spacing }) =>
  createStyles({
    row: {
      '&:last-child': {
        borderBottom: 0,
      },
    },
    profileImage: {
      position: 'relative',
      margin: spacing(-2.5, 2, 0, 3),
    },
    profileInfoContainer: {
      display: 'flex',
      flexDirection: 'row',
      justifyItems: 'flex-end',
      alignItems: 'flex-end',
    },
    userName: {
      marginBottom: spacing(1),
    },
  }),
);`;
