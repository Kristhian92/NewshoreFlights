import React from "react";
import axios from "axios";
import fx from "money";
import Styles from "../Form/Form.module.css";

export default class Form extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      origin: "",
      destination: "",
      originMessage: "",
      destinationMessage: "",
      journey: null,
      error: null,
      selectedCurrency: "USD",
    };
  }

  componentDidMount() {
    fx.base = "USD";
    fx.rates = {
      USD: 1,
      EUR: 0.92,
      COP: 4.68728,
    };
    this.setState({ fx });
  }

  handleChange = (event) => {
    const value = event.target.value;
    const name = event.target.name;
    // Obtener el valor del otro input
    const otherInputValue =
      name === "origin" ? this.state.destination : this.state.origin;
    this.setState((prevState) => {
      if (prevState[name] === value) {
        return null;
      }
      return { [name]: value };
    });
    // validar que no se repita el valor con el otro input
    if (value === otherInputValue) {
      this.setState({
        [`${name}Message`]: "El valor no puede ser igual al origen",
      });
    } else if (value.length === 3 && /^[A-Z]+$/.test(value)) {
      this.setState({ [`${name}Message`]: "" });
    } else {
      this.setState({
        [`${name}Message`]: "Solo se aceptan tres letras en Mayusculas",
      });
    }
  };

  handleCurrencyChange = (event) => {
    this.setState({ selectedCurrency: event.target.value });
    //Actualizar el valor del precio en la moneda seleccionada
    let price = 0;
    if (event.target.value === "USD") {
      price = this.state.journey.Journey.Price;
    } else {
      price = fx.convert(this.state.journey.Journey.Price, {
        from: "USD",
        to: event.target.value,
      });
    }
    //Guardar el valor del precio en el estado
    this.setState({ price });
  };

  handleSubmit = (event) => {
    event.preventDefault();
    const { origin, destination } = this.state;
    axios
      .get(
        `http://localhost:3001/viajes?origin=${origin}&destination=${destination}`
      )
      .then((response) => {
        this.setState({ journey: response.data, error: null });
      })
      .catch((error) => {
        console.log(error);
        this.setState({ error: "No existe ese destino" });
      });
  };

  render() {
    const { journey, selectedCurrency, fx, error } = this.state;
    let price = 0;
    if (journey && selectedCurrency) {
      price =
        selectedCurrency === "USD"
          ? journey.Journey.Price
          : fx.convert(journey.Journey.Price, {
              from: "USD",
              to: selectedCurrency,
            });
    }

    return (
      <>
        <h1>Elige Tú Destino</h1>
        <form onSubmit={this.handleSubmit}>
          <label className={Styles.label}>Origen:</label>
          <br />
          <input
            className={Styles.input}
            autoComplete="off"
            pattern="[A-Z]{3}"
            type="text"
            name="origin"
            value={this.state.origin}
            onChange={this.handleChange}
          />
          <div className={Styles.error}>{this.state.originMessage}</div>
          <br />
          <label className={Styles.label}>Destino:</label>
          <br />
          <input
            className={Styles.input}
            autoComplete="off"
            pattern="[A-Z]{3}"
            type="text"
            name="destination"
            value={this.state.destination}
            onChange={this.handleChange}
          />
          <div className={Styles.error}>{this.state.destinationMessage}</div>
          
          <button className={Styles.button} type="submit">Buscar</button>
          {journey && (
            <div className={Styles.div}>
            <p>Origen: {journey.Journey.Origin}</p>
            <p>Destino: {journey.Journey.Destination}</p>
            <select name="currency" onChange={this.handleCurrencyChange}>
              <option value="USD">Dólares</option>
              <option value="COP">Pesos Colombianos</option>
              <option value="EUR">Euros</option>
            </select>
            <p>
              Precio en {selectedCurrency}: {price}
            </p>
          </div>
          )}
          {error && <div className={Styles.error}>{error}</div>}
        </form>
      </>
    );
  }
}
