import React from "react";
import { connect } from "react-redux";
import { Form, Col, Row, Modal, Button } from "react-bootstrap";
import {
  setCandlesInterval,
  addIndicator,
  setIndicator,
} from "../../actions/candlesActions";

class ChartSettings extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      show: false,
      selectedIndicator: null,
    };
  }

  intervalChanged(e) {
    this.props.dispatch(setCandlesInterval(e.target.value));
  }

  indicatorChanged(e) {
    const { name, checked } = e.target;
    this.props.dispatch(setIndicator({ name, enabled: checked }));
  }

  renderModal() {
    const { show, selectedIndicator } = this.state;

    const handleClose = () => this.setState({ show: false });

    const handleSave = () => {
      this.props.dispatch(
        setIndicator({
          name: selectedIndicator.name,
          windowSize: parseInt(this.refs.windowSize.value),
          sourcePath: this.refs.sourcePath ? this.refs.sourcePath.value : null,
          enabled: selectedIndicator.enabled,
        })
      );
      handleClose();
    };
    if (!selectedIndicator) return;
    return (
      <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>{selectedIndicator.name}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group as={Col} controlId="windowSize">
              <Form.Label>Window Size</Form.Label>
              <Form.Control
                type="text"
                ref="windowSize"
                className="w-50 ml-1"
                defaultValue={selectedIndicator.windowSize}
              />
            </Form.Group>
            {selectedIndicator.type === "ema" ? (
              <Form.Group as={Col} controlId="sourcePath">
                <Form.Label>Source Path</Form.Label>
                <Form.Control
                  as="select"
                  ref="sourcePath"
                  className="w-50 ml-1"
                  defaultValue={selectedIndicator.sourcePath}
                >
                  <option>open</option>
                  <option>close</option>
                </Form.Control>
              </Form.Group>
            ) : null}
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="primary" onClick={handleSave}>
            Save Changes
          </Button>
        </Modal.Footer>
      </Modal>
    );
  }

  handleAddIndicator() {
    const type = this.refs.indicatorSelect.value;
    const sourcePath = type === "ema" ? "close" : null;
    const stroke = type === "ema" ? "blue" : "green";
    const windowSize = 20;
    const name = `${type}-${windowSize}`;

    if (
      this.props.indicators.length > 0 &&
      this.props.indicators.filter((indicator) => indicator.name === name)
        .length > 0
    )
      return;

    this.props.dispatch(
      addIndicator({
        name,
        type,
        enabled: true,
        windowSize,
        sourcePath,
        stroke,
      })
    );
  }

  renderSettings() {
    const indicators = this.props.indicators;
    const handleShow = (indicator) =>
      this.setState({ show: true, selectedIndicator: indicator });
    return (
      <Form>
        <Form.Row>
          <Form.Group as={Col} controlId="intervalSelect">
            <Form.Label>Interval</Form.Label>
            <Form.Control
              as="select"
              onChange={this.intervalChanged.bind(this)}
            >
              <option>1m</option>
              <option>5m</option>
              <option>1h</option>
              <option>1d</option>
            </Form.Control>
          </Form.Group>
        </Form.Row>
        <Form.Row>
          <Form.Group as={Col} controlId="indicators">
            {indicators.map((indicator) => (
              <Row style={{ marginLeft: 0 }}>
                <Form.Check
                  type="switch"
                  id={indicator.name}
                  name={indicator.name}
                  label={indicator.name}
                  defaultChecked={indicator.enabled}
                  onChange={this.indicatorChanged.bind(this)}
                />
                <a href="#" onClick={handleShow.bind(this, indicator)}>
                  <svg
                    className="bi bi-pencil text-secondary"
                    width="1em"
                    height="1em"
                    viewBox="0 0 16 16"
                    fill="currentColor"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      fill-rule="evenodd"
                      d="M11.293 1.293a1 1 0 011.414 0l2 2a1 1 0 010 1.414l-9 9a1 1 0 01-.39.242l-3 1a1 1 0 01-1.266-1.265l1-3a1 1 0 01.242-.391l9-9zM12 2l2 2-9 9-3 1 1-3 9-9z"
                      clip-rule="evenodd"
                    />
                    <path
                      fill-rule="evenodd"
                      d="M12.146 6.354l-2.5-2.5.708-.708 2.5 2.5-.707.708zM3 10v.5a.5.5 0 00.5.5H4v.5a.5.5 0 00.5.5H5v.5a.5.5 0 00.5.5H6v-1.5a.5.5 0 00-.5-.5H5v-.5a.5.5 0 00-.5-.5H3z"
                      clip-rule="evenodd"
                    />
                  </svg>
                </a>
              </Row>
            ))}
            <Form.Control as="select" ref="indicatorSelect">
              <option>sma</option>
              <option>ema</option>
            </Form.Control>
            <Button onClick={this.handleAddIndicator.bind(this)}>Add</Button>
          </Form.Group>
        </Form.Row>
      </Form>
    );
  }

  render() {
    return (
      <Col>
        {this.renderModal()}
        {this.renderSettings()}
      </Col>
    );
  }
}

const mapStateToProps = (state) => ({
  indicators: state.candles.indicators,
});

export default connect(mapStateToProps)(ChartSettings);
