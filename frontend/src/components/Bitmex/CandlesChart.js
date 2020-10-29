import React from "react";
import { connect } from "react-redux";
import { ChartCanvas, Chart } from "react-stockcharts";
import { ema, sma } from "react-stockcharts/lib/indicator";
import { XAxis, YAxis } from "react-stockcharts/lib/axes";
import {
  CrossHairCursor,
  CurrentCoordinate,
  MouseCoordinateX,
  MouseCoordinateY,
  PriceCoordinate,
} from "react-stockcharts/lib/coordinates";
import {
  BarSeries,
  CandlestickSeries,
  LineSeries,
} from "react-stockcharts/lib/series";
import { discontinuousTimeScaleProvider } from "react-stockcharts/lib/scale";
import {
  OHLCTooltip,
  MovingAverageTooltip,
} from "react-stockcharts/lib/tooltip";

import { last } from "react-stockcharts/lib/utils";

import { format } from "d3-format";
import { timeFormat } from "d3-time-format";

import { fitWidth } from "react-stockcharts/lib/helper";
import Alert from "react-bootstrap/Alert";
import { fetchCandles } from "../../actions/candlesActions";
import { areTimesEqual } from "../../utils/time";
import { subscribe } from "../../utils/realtimeConnector";

class CandlesChart extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      candles: null,
    };
  }

  getCandles() {
    const interval = this.props.interval;
    this.props.dispatch(fetchCandles(interval, 1000)).then(() => {
      this.processCurrentCandle(this.props.candles);
    });
  }

  componentDidMount() {
    this.getCandles();
  }

  componentDidUpdate(prevProps) {
    if (this.props.interval !== prevProps.interval) {
      this.getCandles();
    }
  }

  processCurrentCandle(initialCandles) {
    const symbol = "XBTUSD";
    let currentCandle = initialCandles.pop();
    const candles = initialCandles;
    subscribe("CANDLE", (data) => {
      const transaction = JSON.parse(data);
      const now = new Date();
      const closeTime = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
        now.getHours(),
        now.getMinutes() + 1,
        0
      );

      if (now >= currentCandle.date.getTime()) {
        candles.push(currentCandle);
        currentCandle = {
          symbol,
          date: closeTime,
          timestamp: closeTime.toString(),
        };
      }

      let { timestamp, price } = transaction;
      timestamp = new Date(timestamp);
      price = parseFloat(price);

      if (areTimesEqual(now, timestamp, this.props.interval)) {
        if (!currentCandle.open) {
          currentCandle.symbol = symbol;
          currentCandle.open = currentCandle.close = currentCandle.low = currentCandle.high = price;
        }
        currentCandle.close = price;

        if (currentCandle.low > price) currentCandle.low = price;
        if (currentCandle.high < price) currentCandle.high = price;
      }
      const result = candles.slice();
      result.push(currentCandle);
      this.setState({ candles: result });
    });
  }

  getIndicatorsToRender(indicators) {
    return indicators
      .filter((i) => i.enabled)
      .map((indicator) => {
        const { type, windowSize, sourcePath, stroke } = indicator;
        let renderable;
        switch (type) {
          case "ema":
            renderable = ema()
              .options({
                windowSize,
                sourcePath,
              })
              .skipUndefined(true)
              .merge((d, c) => {
                d[`ema${windowSize}`] = c;
              })
              .accessor((d) => d[`ema${windowSize}`])
              .stroke(stroke);
            break;
          case "sma":
            renderable = sma()
              .options({ windowSize })
              .merge((d, c) => {
                d[`sma${windowSize}`] = c;
              })
              .accessor((d) => d[`sma${windowSize}`])
              .stroke(stroke);
            break;
          default:
            return;
        }
        return {
          ...indicator,
          renderable,
        };
      });
  }

  render() {
    const { width, ratio } = this.props;
    const indicators = this.props.indicators;
    const candles = this.state.candles;
    const orders = this.props.orders.filter(
      (o) => o.status === "Placed" || o.status === "Waiting"
    );
    if (!candles || candles.length < 1)
      return <Alert variant="warning">No candles available</Alert>;

    const renderableIndicators = this.getIndicatorsToRender(indicators);

    let calculatedData = candles;
    const yExtents = renderableIndicators.map((indicator) => {
      calculatedData = indicator.renderable(calculatedData);
      return indicator.renderable.accessor();
    });
    const xScaleProvider = discontinuousTimeScaleProvider.inputDateAccessor(
      (d) => d.date
    );
    const { data, xScale, xAccessor, displayXAccessor } = xScaleProvider(
      calculatedData
    );

    const lastCandle = last(data);
    const start = xAccessor(lastCandle);
    const end = xAccessor(data[Math.max(0, data.length - 150)]);
    const xExtents = [start, end];

    yExtents.push((d) => [d.high, d.low]);
    return (
      <ChartCanvas
        height={600}
        width={width}
        ratio={ratio}
        margin={{ left: 70, right: 70, top: 10, bottom: 30 }}
        type="hybrid"
        seriesName="MSFT"
        data={data}
        xScale={xScale}
        xAccessor={xAccessor}
        displayXAccessor={displayXAccessor}
        xExtents={xExtents}
      >
        <Chart id={1} yExtents={yExtents} padding={{ top: 10, bottom: 20 }}>
          <XAxis axisAt="bottom" orient="bottom" />
          <YAxis axisAt="right" orient="right" ticks={5} />

          <MouseCoordinateY
            at="right"
            orient="right"
            displayFormat={format(".1f")}
          />

          <CandlestickSeries />
          {renderableIndicators.map((indicator) => (
            <LineSeries
              yAccessor={indicator.renderable.accessor()}
              stroke={indicator.renderable.stroke()}
            />
          ))}
          {renderableIndicators.map((indicator) => (
            <CurrentCoordinate
              yAccessor={indicator.renderable.accessor()}
              fill={indicator.renderable.stroke()}
            />
          ))}

          <OHLCTooltip origin={[-40, 0]} />

          <PriceCoordinate
            at="right"
            orient="right"
            price={lastCandle.close}
            displayFormat={format(".1f")}
          />

          {orders.map((o, i) => (
            <PriceCoordinate
              key={i}
              at="right"
              orient="right"
              price={parseFloat(o.price)}
              fill={o.side === "Buy" ? "#6BA583" : "red"}
              displayFormat={format(".1f")}
            />
          ))}

          <MovingAverageTooltip
            onClick={(e) => console.log(e)}
            origin={[-38, 15]}
            options={renderableIndicators.map((indicator) => {
              return {
                yAccessor: indicator.renderable.accessor(),
                type: indicator.type,
                stroke: indicator.renderable.stroke(),
                windowSize: indicator.windowSize,
              };
            })}
          />
        </Chart>
        <Chart
          id={2}
          yExtents={[(d) => d.volume]}
          height={150}
          origin={(w, h) => [0, h - 150]}
        >
          <YAxis
            axisAt="left"
            orient="left"
            ticks={5}
            tickFormat={format(".2s")}
          />

          <MouseCoordinateX
            at="bottom"
            orient="bottom"
            displayFormat={timeFormat("%H:%M:%S")}
          />
          <MouseCoordinateY
            at="left"
            orient="left"
            displayFormat={format(".4s")}
          />

          <BarSeries
            yAccessor={(d) => d.volume}
            fill={(d) => (d.close > d.open ? "#6BA583" : "red")}
          />
          <CurrentCoordinate yAccessor={(d) => d.volume} fill="#9B0A47" />
        </Chart>
        <CrossHairCursor />
      </ChartCanvas>
    );
  }
}

CandlesChart = fitWidth(CandlesChart);

const mapStateToProps = (state) => ({
  orders: state.orders.orders,
  candles: state.candles.candles,
  currentCandle: state.candles.currentCandle,
  interval: state.candles.interval,
  indicators: state.candles.indicators,
});

export default connect(mapStateToProps)(CandlesChart);
