/* eslint-disable react/prop-types, react/jsx-handler-names */

import React from 'react';
import PropTypes from 'prop-types';
import Select from 'react-select';
import { withStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import NoSsr from '@material-ui/core/NoSsr';
import TextField from '@material-ui/core/TextField';
import Paper from '@material-ui/core/Paper';
import MenuItem from '@material-ui/core/MenuItem';

const styles = theme => ({
    root: {
        flexGrow: 1,
        height: 50,
    },
    input: {
        display: 'flex',
        padding: 0,
    },
    valueContainer: {
        display: 'flex',
        flexWrap: 'wrap',
        flex: 1,
        alignItems: 'center',
        overflow: 'hidden',
    },
    noOptionsMessage: {
        padding: `${theme.spacing.unit}px ${theme.spacing.unit * 2}px`,
    },
    singleValue: {
        fontSize: 16,
    },
    placeholder: {
        position: 'absolute',
        left: 2,
        fontSize: 16,
    },
    paper: {
        position: 'absolute',
        zIndex: 1,
        marginTop: theme.spacing.unit,
        left: 0,
        right: 0,
    },
    select: {
        zIndex: 10000
    }
});

function NoOptionsMessage(props) {
    return (
        <Typography
            color="textSecondary"
            className={props.selectProps.classes.noOptionsMessage}
            {...props.innerProps}
        >
            {props.children}
        </Typography>
    );
}

function inputComponent({ inputRef, ...props }) {
    return <div ref={inputRef} {...props} />;
}

function Control(props) {
    return (
        <TextField
            fullWidth
            InputProps={{
                inputComponent,
                inputProps: {
                    className: props.selectProps.classes.input,
                    inputRef: props.innerRef,
                    children: props.children,
                    ...props.innerProps,
                },
            }}
            {...props.selectProps.textFieldProps}
        />
    );
}

function Option(props) {
    return (
        <MenuItem
            buttonRef={props.innerRef}
            selected={props.isFocused}
            component="div"
            style={{
                fontWeight: props.isSelected ? 500 : 400,
            }}
            {...props.innerProps}
        >
            {props.children}
        </MenuItem>
    );
}

function Placeholder(props) {
    return (
        <Typography
            color="textSecondary"
            className={props.selectProps.classes.placeholder}
            {...props.innerProps}
        >
            {props.children}
        </Typography>
    );
}

function SingleValue(props) {
    return (
        <Typography className={props.selectProps.classes.singleValue} {...props.innerProps}>
            {props.children}
        </Typography>
    );
}

function ValueContainer(props) {
    return <div className={props.selectProps.classes.valueContainer}>{props.children}</div>;
}

function Menu(props) {
    return (
        <Paper square className={props.selectProps.classes.paper} {...props.innerProps}>
            {props.children}
        </Paper>
    );
}

const components = {
    Control,
    Menu,
    NoOptionsMessage,
    Option,
    Placeholder,
    SingleValue,
    ValueContainer,
};

class IntegrationReactSelect extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            single: null,
        };
    }

    handleChange = event => value => {
        this.props.handleChange(value.label, value.value);
    };

    render() {
        const { classes, theme, value, dataObj, handleChange, selectedLanguage } = this.props;

          var suggestionGn = [];
          selectedLanguage=="en" ? 
          suggestionGn = dataObj.allCodes.map((c, k) => {
            let currGn = dataObj.byCode[c];
            return (
                currGn.name !== "NONE" && (
                {label: currGn.name, value: currGn.code }
              )
            );
          }) :
          selectedLanguage=="si" ? 
          suggestionGn = dataObj.allCodes.map((c, k) => {
            let currGn = dataObj.byCode[c];
            return (
                currGn.name !== "NONE" && (
                {label: currGn.sn_name, value: currGn.code }
              )
            );
          }) :
          suggestionGn = dataObj.allCodes.map((c, k) => {
            let currGn = dataObj.byCode[c];
            return (
                currGn.name !== "NONE" && (
                {label: currGn.tm_name, value: currGn.code }
              )
            );
          })

        if( dataObj.byCode[value]){
            if(selectedLanguage=="en"){
                var gn=[
                    {
                    label: dataObj.byCode[value].name,
                    value: value
                    }
                ]
            }else if(selectedLanguage=="si"){
                var gn=[
                    {
                      label: dataObj.byCode[value].sn_name,
                      value: value
                    }
                  ]
            }else{
                var gn=[
                    {
                      label: dataObj.byCode[value].tm_name,
                      value: value
                    }
                  ]
            }
        }

        const selectStyles = {
            input: base => ({
                ...base,
                color: theme.palette.text.primary,
                '& input': {
                    font: 'inherit',
                },
            }),

            menuList: (provided, state) => ({
                ...provided,
                zIndex: 100000
            })
        };

        return (
            <div className={classes.root}>
                <NoSsr>
                    <Select
                        classes={classes}
                        styles={selectStyles}
                        options={suggestionGn}
                        components={components}
                        value={gn}
                        onChange={selectedOption => {
                            handleChange("recipientGramaNiladhari")(selectedOption.value);
                          }}
                        name="recipientGramaNiladhari"
                        placeholder="Search Grama Niladhari Division by name"
                    />
                </NoSsr>
            </div>
        );
    }
}

IntegrationReactSelect.propTypes = {
    classes: PropTypes.object.isRequired,
    theme: PropTypes.object.isRequired,
};

export default withStyles(styles, { withTheme: true })(IntegrationReactSelect);