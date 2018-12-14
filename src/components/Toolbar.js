import React, {Component} from 'react';
import '../assets/css/css_toolbar.css';
import MaterialIcon from 'material-icons-react';

const RichIcons = [
    "format_bold",
    "format_italic",
    "format_underlined",
    "code",
    "looks_one",
    "looks_two",
    "list",
    "format_list_numbered",
];

class Toolbar extends Component {

    clicked =  icon => {
        console.log(icon);
    };

    render() {
        return (
            <div className="toolbar">
                {
                    RichIcons.map(icon => {
                        return (
                            <span onClick={() => this.clicked(icon)} key={icon}>
                                <MaterialIcon icon={icon} size={18} />
                            </span>
                        )
                    })
                }
            </div>
        );
    }
}

export default Toolbar;