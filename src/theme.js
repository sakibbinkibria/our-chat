import {createMuiTheme} from '@material-ui/core/styles';
import { palette } from '@material-ui/system';

const theme = createMuiTheme({
	palette: {
		primary: {
            main: '#20948B'
		},
		secondary: {
			main: '#F07167'
		},
		grey: {
			300: '#ffffff',
		},
		error: {
			main: '#f44336',
		},
		textSecondary:{
			main: '#ababab',
		}
    },

    typography: {
        body2: {
          color: "#FFFF",
        },
	},

});

export default theme;