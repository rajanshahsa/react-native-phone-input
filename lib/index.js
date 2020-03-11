import React, { Component } from "react";
import { Image, TextInput, TouchableWithoutFeedback, View } from "react-native";
import PropTypes from "prop-types";

import Country from "./country";
import Flags from "./resources/flags";
import PhoneNumber from "./phoneNumber";
import styles from "./styles";
import CountryPicker from "./countryPicker";
import { TextField } from "react-native-material-textfield";
import colors from '../../../app/config/colors'

export default class PhoneInput extends Component {
  static setCustomCountriesData(json) {
    Country.setCustomCountriesData(json);
  }

  constructor(props, context) {
    super(props, context);

    this.onChangePhoneNumber = this.onChangePhoneNumber.bind(this);
    this.onPressFlag = this.onPressFlag.bind(this);
    this.selectCountry = this.selectCountry.bind(this);
    this.getFlag = this.getFlag.bind(this);
    this.getISOCode = this.getISOCode.bind(this);

    const { countriesList, disabled, initialCountry } = this.props;

    if (countriesList) {
      Country.setCustomCountriesData(countriesList);
    }
    const countryData = PhoneNumber.getCountryDataByCode(initialCountry);

    this.state = {
      iso2: initialCountry,
      disabled,
      // formattedNumber: countryData ? `+${countryData.dialCode} ` : "",
      formattedNumber: "",
      prefix: countryData ? `+${countryData.dialCode}` : "",
      value: null
    };
  }

  componentWillMount() {
    if (this.props.value) {
      this.updateFlagAndFormatNumber(this.props.value);
    }
  }

  componentWillReceiveProps(nextProps) {
    const { value, disabled } = nextProps;
    this.setState({ disabled });

    if (value && value !== this.state.value) {
      this.setState({ value });
      this.updateFlagAndFormatNumber(value);
    }
  }

  onChangePhoneNumber(number) {
    const actionAfterSetState = this.props.onChangePhoneNumber
      ? () => {
        this.props.onChangePhoneNumber(number);
      }
      : null;
    this.updateFlagAndFormatNumber(number, actionAfterSetState);
  }

  onPressFlag() {
    if (this.props.onPressFlag) {
      this.props.onPressFlag();
    } else {
      if (this.state.iso2) this.picker.selectCountry(this.state.iso2);
      this.picker.show();
    }
  }

  getPickerData() {
    return PhoneNumber.getAllCountries().map((country, index) => ({
      key: index,
      image: Flags.get(country.iso2),
      label: country.name,
      dialCode: `+${country.dialCode}`,
      iso2: country.iso2
    }));
  }

  getCountryName() {
    const countryData = PhoneNumber.getCountryDataByCode(this.state.iso2);
    if (countryData.dialCode === '91') {
      return "India"
    } else {
      return countryData.name
    }
  }

  getCountryCode() {
    const countryData = PhoneNumber.getCountryDataByCode(this.state.iso2);
    return countryData.dialCode;
  }

  getAllCountries() {
    return PhoneNumber.getAllCountries();
  }

  getFlag(iso2) {
    return Flags.get(iso2);
  }

  getDialCode() {
    return PhoneNumber.getDialCode(this.state.formattedNumber);
  }

  getValue() {
    if(!this.state.formattedNumber){
      return ""
    }
    return this.state.prefix + this.state.formattedNumber;
  }

  //Custom logic 
  //to set and format give number by phone ref from any component
  setPhoneValue(number) {
    console.log("setPhoneValue")
    if (number && number != "") {
      if (number.includes('+') && this.state.iso2 != null && this.state.iso2 != "") {
        let dialCode = this.getDialCode(number)
        console.log("Dial code " + dialCode)
        let formatted_number = this.format(number, this.state.iso2)
        console.log(formatted_number)
        this.setState({
          formattedNumber: formatted_number
        })
      } else {
        this.setState({
          formattedNumber: number
        })
      }

    }
    else {
      this.setState({
        formattedNumber: ""
      })
    }
  }

  setPrefix(prefix) {
    const iso2 = PhoneNumber.getCountryCodeOfNumber(prefix);
    setTimeout(() =>{
      this.setState({
        prefix: prefix,
        iso2: iso2
      })
    },200)
  }

  getPrefix(prefix) {
    
   return PhoneNumber.getCountryDataByCode(this.state.iso2).dialCode;
  }

  getNumberType() {
    return PhoneNumber.getNumberType(
      this.state.formattedNumber,
      this.state.iso2
    );
  }

  getISOCode() {
    return this.state.iso2;
  }

  selectCountry(iso2) {
    if (this.state.iso2 !== iso2) {
      const countryData = PhoneNumber.getCountryDataByCode(iso2);
      console.log("countryData-->" + JSON.stringify(countryData))
      if (countryData) {
        this.setState(
          {
            iso2,
            prefix: `+${countryData.dialCode}`,
            formattedNumber: ``
          },
          () => {
            this.inputPhone.focus();
            if (this.props.onSelectCountry) this.props.onSelectCountry(iso2);
          }
        );
      }
    }
  }

  isValidNumber() {
    return PhoneNumber.isValidNumber(
      this.state.formattedNumber,
      this.state.iso2
    );
  }

  format(text, code = "") {
    return this.props.autoFormat
      ? PhoneNumber.format(text, this.state.iso2)
      : text;
  }

  // updateFlagAndFormatNumber(number, actionAfterSetState = null) {
  //   const { allowZeroAfterCountryCode, initialCountry } = this.props;

  //   let iso2 = initialCountry;
  //   let phoneNumber = number;

  //   if (number) {
  //     if (phoneNumber[0] !== "+") phoneNumber = `+${phoneNumber}`;
  //     phoneNumber = allowZeroAfterCountryCode
  //       ? phoneNumber
  //       : this.possiblyEliminateZeroAfterCountryCode(phoneNumber);
  //     iso2 = PhoneNumber.getCountryCodeOfNumber(phoneNumber);
  //   }
  //   this.setState({ iso2, formattedNumber: this.format(phoneNumber) }, actionAfterSetState);
  // }


  updateFlagAndFormatNumber(number, actionAfterSetState = null) {
    const { allowZeroAfterCountryCode, initialCountry } = this.props;

    let iso2 = initialCountry;
    let phoneNumber = number;

    if (number) {
      // if (phoneNumber[0] !== "+") phoneNumber = `+${phoneNumber}`;
      phoneNumber = allowZeroAfterCountryCode
        ? phoneNumber
        : this.possiblyEliminateZeroAfterCountryCode(phoneNumber);

    }
    iso2 = PhoneNumber.getCountryCodeOfNumber(this.state.prefix);

    this.setState({ iso2, formattedNumber: this.format(phoneNumber) }, actionAfterSetState);
  }


  possiblyEliminateZeroAfterCountryCode(number) {

    //custom logic to prevent user enteres 0
    const dialCode = PhoneNumber.getDialCode(number);

    let numberCopy = number.trim()
    let rawNumber = numberCopy.substr(dialCode.length)
    rawNumber = rawNumber.trim()

    if (rawNumber.charAt(0) == '0') {
      rawNumber = rawNumber.replace(/0+/g, '');
      return dialCode + rawNumber
    }
    else {
      return number
    }

    //original code 

    // const dialCode = PhoneNumber.getDialCode(number);
    // return number.startsWith(`${dialCode}0`)
    //   ? dialCode + number.substr(dialCode.length + 1)
    //   : number;
  }

  focus() {
    this.inputPhone.focus();
  }

  blur() {
    this.inputPhone.blur();
  }

  render() {
    const { iso2, formattedNumber, disabled } = this.state;
    const TextComponent = this.props.textComponent || TextField;
    return (
      <View style={[styles.container, this.props.style]}>
        <TouchableWithoutFeedback
          onPress={this.onPressFlag}
          disabled={disabled}
        >
          <Image
            source={Flags.get(iso2)}
            style={[styles.flag, this.props.flagStyle]}
            onPress={this.onPressFlag}
          />
        </TouchableWithoutFeedback>
        <View style={{ flex: 1, marginLeft: this.props.offset || 0 }}>
          <TextComponent
            ref={ref => {
              this.inputPhone = ref;
            }}
            editable={!disabled}
            autoCorrect={false}
            style={[styles.text, this.props.textStyle]}
            onChangeText={text => {
              this.onChangePhoneNumber(text);


            }}
            lineWidth={0.3}
            activeLineWidth={0.3}
            keyboardType="number-pad"
            underlineColorAndroid="rgba(0,0,0,0)"
            value={formattedNumber}
            prefix={this.state.prefix}
            {...this.props.textProps}
          />
        </View>

        <CountryPicker
          ref={ref => {
            this.picker = ref;
          }}
          selectedCountry={iso2}
          onSubmit={this.selectCountry}
          buttonColor={this.props.pickerButtonColor}
          buttonTextStyle={this.props.pickerButtonTextStyle}
          itemStyle={[this.props.itemStyle]}
          cancelText={this.props.cancelText}
          cancelTextStyle={this.props.cancelTextStyle}
          confirmText={this.props.confirmText}
          confirmTextStyle={this.props.confirmTextStyle}
          pickerBackgroundColor={this.props.pickerBackgroundColor}
          itemStyle={this.props.pickerItemStyle}
        />
      </View>
    );
  }
}

const styleType = PropTypes.oneOfType([PropTypes.object, PropTypes.number]);

PhoneInput.propTypes = {
  textComponent: PropTypes.func,
  initialCountry: PropTypes.string,
  onChangePhoneNumber: PropTypes.func,
  value: PropTypes.string,
  style: styleType,
  flagStyle: styleType,
  textStyle: styleType,
  offset: PropTypes.number,
  textProps: PropTypes.object,
  onSelectCountry: PropTypes.func,
  pickerButtonColor: PropTypes.string,
  pickerBackgroundColor: PropTypes.string,
  pickerItemStyle: styleType,
  countriesList: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string,
      iso2: PropTypes.string,
      dialCode: PropTypes.string,
      priority: PropTypes.number,
      areaCodes: PropTypes.arrayOf(PropTypes.string)
    })
  ),
  cancelText: PropTypes.string,
  cancelTextStyle: styleType,
  confirmText: PropTypes.string,
  confirmTextTextStyle: styleType,
  disabled: PropTypes.bool,
  allowZeroAfterCountryCode: PropTypes.bool
};

PhoneInput.defaultProps = {
  initialCountry: "gb",
  disabled: false,
  allowZeroAfterCountryCode: true
};
