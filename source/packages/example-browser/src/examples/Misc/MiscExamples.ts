import {
  AreaSeries,
  AxisPosition,
  create2DArray,
  DataPoint,
  DataPointSeries,
  formatTimeSpan,
  FunctionSeries,
  Legend,
  LegendOrientation,
  LegendPlacement,
  LegendPosition,
  LinearAxis,
  LineSeries,
  LineStyle,
  MarkerType,
  newDataPoint,
  OxyColorHelper,
  OxyColors,
  OxyMouseButton,
  PlotModel,
  PlotType,
  TickStyle,
  type TickValuesType,
  TimeSpan,
  TimeSpanAxis,
} from 'oxyplot-js'
import type { ExampleCategory } from '../types'
import lineaPoints from './linea-points'
import { MatrixSeries } from '../CustomSeries/MatrixSeries'

function numericOdeSolvers1(): PlotModel {
  return numericOdeSolvers('Numeric ODE solvers', "y'=y, y(0)=1", 0, 1, Math.exp, (t: number, y: number) => y)
}

function numericOdeSolvers2(): PlotModel {
  return numericOdeSolvers(
    'Numeric ODE solvers',
    "y'=x, y(0)=0",
    0,
    0,
    (t) => 0.5 * t * t,
    (t: number, y: number) => t,
  )
}

function numericOdeSolvers3(): PlotModel {
  return numericOdeSolvers('Numeric ODE solvers', "y'=cos(x), y(0)=0", 0, 0, Math.sin, (t: number, y: number) =>
    Math.cos(t),
  )
}

function trainSchedule(): PlotModel {
  // http://www.edwardtufte.com/tufte/books_vdqi
  // http://marlenacompton.com/?p=103
  // http://mbostock.github.com/protovis/ex/caltrain.html
  // http://en.wikipedia.org/wiki/%C3%89tienne-Jules_Marey
  // http://mbostock.github.com/protovis/ex/marey-train-schedule.jpg
  // http://c82.net/posts.php?id=66

  const model = new PlotModel({
    title: 'Train schedule',
    subtitle: 'Bergensbanen (Oslo-Bergen, Norway)',
    isLegendVisible: false,
    plotAreaBorderColor: OxyColors.LightGray,
  })

  const distanceAxis = new LinearAxis({
    position: AxisPosition.Left,
    minimum: -20,
    maximum: 540,
    title: 'Distance from Oslo S',
    isAxisVisible: true,
    //stringFormat: '0'
  })

  model.axes.push(distanceAxis)

  const stationAxis = new CustomAxis({
    majorGridlineStyle: LineStyle.Solid,
    majorGridlineColor: OxyColors.LightGray,
    minimum: distanceAxis.minimum,
    maximum: distanceAxis.maximum,
    position: AxisPosition.Right,
    isPanEnabled: false,
    isZoomEnabled: false,
    majorTickSize: 0,
  })

  distanceAxis.axisChanged = (sender, e) => {
    stationAxis.minimum = distanceAxis.actualMinimum
    stationAxis.maximum = distanceAxis.actualMaximum
  }

  model.axes.push(stationAxis)

  model.axes.push(
    new TimeSpanAxis({
      position: AxisPosition.Bottom,
      minimum: 0,
      maximum: TimeSpanAxis.toDouble(TimeSpan.fromHours(24)),
      // stringFormat: 'hh',
      stringFormatter: (ts: TimeSpan) => Math.abs(ts.hours).toString().padStart(2, '0'),
      title: 'Time',
      majorStep: TimeSpanAxis.toDouble(TimeSpan.fromHours(1)),
      minorStep: TimeSpanAxis.toDouble(TimeSpan.fromMinutes(10)),
      tickStyle: TickStyle.None,
      majorGridlineStyle: LineStyle.Solid,
      majorGridlineColor: OxyColors.LightGray,
      minorGridlineStyle: LineStyle.Solid,
      minorGridlineColor: OxyColorHelper.fromArgb(255, 240, 240, 240),
    }),
  )

  //  the train schedule
  const bergensbanenLines = `Stasjon;km;moh;609;61;601;1405;607;603;63;605;62;602;608;604;64;610;1404;606
Oslo;0.00;4.0;0631;0811;1037;;1227;1437;1609;2311;1432;1736;1956;2210;2236;2348;;0626
Lysaker;7.00;7.5;0642;0822;1048;;1238;1448;1620;2322;1420;1724;1944;2158;2224;;;
Asker;23.83;104.6;0653;0832;1059;;1249;1458;1630;2334;1409;1713;1932;2144;2214;2324;;0555
Drammen;52.86;2.2;0708;0846;1115;;1303;1513;1645;2351;1354;1701;1914;2125;2201;2307;;0540
Hokksund;70.22;8.0;;;1136;;1320;1531;;0007;;1638;1854;2111;2140;;;0525
Vikersund;95.91;67.1;;;1158;;1349;1552;;0029;;1617;1833;2048;;;;0503
Hønefoss;124.21;96.8;0804;0937;1222;;1414;1619;1736;0056;1304;1555;1811;2025;2100;2201;;0442
Flå;186.64;155.0;;;1314;;;1712;;;;1503;1715;1934;;2108;;0349
Nesbyen;220.06;168.8;;1045;1340;;1532;1744;1845;0223;1152;1436;1643;1909;1949;2041;;0321
Gol;237.02;207.4;0930;1100;1354;;1545;1800;1900;0239;1141;1423;1630;1858;1938;2028;;0308
Ål;262.85;436.6;0950;1123;1419;1520;1608;1832;1921;0305;1121;1400;1609;1833;1919;2007;1957;0246
Geilo;287.38;794.2;1013;1145;1442;1545;1630;1855;1942;0328;1059;1339;1547;1812;1857;1946;1939;0224
Ustaoset;299.31;990.6;;1156;1454;1556;1643;1905;1953;0341;1048;1326;1536;1800;1845;;1927;0209
Haugastøl;310.14;988.0;1042;;1505;1606;1655;1916;;0352;;1315;1527;1750;;1922;;0158
Finse;336.74;1222.2;1108;1224;1526;1626;1717;1937;2021;0417;1019;1254;1508;1730;1818;1900;1854;0138
Hallingskeid;357.44;1110.1;1123;;1538;1637;1732;1950;;;;1239;1454;1711;;1842;1839;
Myrdal;370.44;866.8;1137;1253;1551;1650;1746;2003;2045;0445;0953;1225;1440;1657;1752;1828;1825;0105
;370.44;866.8;1220;1258;1556;1652;1751;2004;2047;0445;0950;1220;1439;1652;1750;1823;1822;0101
// Upsete;376.79;850.2;;;;;;;;;;;;;;;;
// Mjølfjell;388.86;627.2;;;;;;;;;;;;;;;;
Voss;419.96;56.5;1312;1343;1640;1738;1836;2048;2130;0537;0910;1139;1355;1608;1710;1736;1740;0015
Dale;459;43.4;;;;;1903;;2156;0608;0836;1109;;;;;;2344
Vaksdal;475.17;16.0;;;;;;;;0626;;;;;;;;2326
Arna;501.43;8.0;1410;1441;1740;1840;1935;2155;2228;0644;0806;1037;1248;1506;1606;1618;1637;2307
Bergen;526.64;3.9;1422;1442;1752;1850;1945;2204;2235;0656;0758;1028;1240;1458;1558;1610;1628;2258
`.split('\n')

  const header = bergensbanenLines[0]
  bergensbanenLines.splice(0, 1)
  const headerFields = header.split(';')
  const lineCount = headerFields.length - 3
  const stations = new LineSeries({
    strokeThickness: 0,
    markerType: MarkerType.Circle,
    markerFill: OxyColorHelper.fromAColor(200, OxyColors.Black),
    markerSize: 4,
  })

  // Add the line series for each train line
  const series = new Array<LineSeries>(lineCount)
  for (let i = 0; i < series.length; i++) {
    series[i] = new LineSeries({
      title: headerFields[3 + i],
      color: OxyColorHelper.fromAColor(180, OxyColors.Black),
      strokeThickness: 2,
      // trackerFormatString: 'Train {0}\nTime: {2}\nDistance from Oslo S: {4:0.0} km'
      trackerStringFormatter: function (args) {
        return `Train ${args.title}
Time: ${formatTimeSpan(args.xValue, 'hh:mm:ss')}
Distance from Oslo S: ${args.yValue.toFixed(1)} km`
      },
    })
    model.series.push(series[i])
  }

  // Parse the train schedule
  for (const line of bergensbanenLines) {
    // skip comments
    if (!line || line.startsWith('//')) {
      continue
    }

    const fields = line.split(';')
    const station = fields[0]
    const x = parseFloat(fields[1])
    if (station) {
      stationAxis.majorTicks.push(x)
      stationAxis.labels.push(station)
    }

    for (let i = 0; i < series.length; i++) {
      const hhmmStr = fields[i + 3]
      if (!hhmmStr) {
        continue
      }

      // Convert time from hhmm to a time span
      const hhmm = parseInt(hhmmStr)
      const span = TimeSpan.from(0, Math.floor(hhmm / 100), hhmm % 100, 0)
      const t = TimeSpanAxis.toDouble(span)

      // Add the point to the line
      series[i].points.push(newDataPoint(t, x))

      // Add the point for the station
      stations.points.push(newDataPoint(t, x))
    }
  }

  // add points and NaN (to make a line break) when passing midnight
  const tmidnight = TimeSpanAxis.toDouble(TimeSpan.fromHours(24))
  for (const s of model.series) {
    if (!(s instanceof DataPointSeries)) continue

    for (let i = 0; i + 1 < s.points.length; i++) {
      if (Math.abs(s.points[i].x - s.points[i + 1].x) > tmidnight / 2) {
        let x0 = s.points[i].x
        if (x0 > tmidnight / 2) {
          x0 -= tmidnight
        }

        let x1 = s.points[i + 1].x
        if (x1 > tmidnight / 2) {
          x1 -= tmidnight
        }

        const y = s.points[i].y + ((s.points[i + 1].y - s.points[i].y) / (x1 - x0)) * (0 - x0)
        s.points.splice(i + 1, 0, newDataPoint(x0 < x1 ? 0 : tmidnight, y))
        s.points.splice(i + 1, 0, newDataPoint(Number.NaN, y))
        s.points.splice(i + 1, 0, newDataPoint(x0 < x1 ? tmidnight : 0, y))
        i += 3
      }
    }
  }

  console.log(stationAxis)
  model.series.push(stations)
  return model
}

function laLineaAreaSeries(): PlotModel {
  const model = new PlotModel({
    title: 'La Linea',
    plotType: PlotType.Cartesian,
    background: OxyColorHelper.fromRgb(84, 98, 207),
  })
  model.axes.push(new LinearAxis({ position: AxisPosition.Left, minimum: -500, maximum: 1000 }))
  const series1 = new AreaSeries({ fill: OxyColors.White, strokeThickness: 0 })
  series1.points.push(...lineaPoints)
  model.series.push(series1)
  return model
}

function laLinea(): PlotModel {
  const model = new PlotModel({
    title: 'La Linea',
    plotType: PlotType.Cartesian,
    background: OxyColorHelper.fromRgb(84, 98, 207),
  })
  model.axes.push(new LinearAxis({ position: AxisPosition.Left, minimum: -500, maximum: 1000 }))
  const series1 = new LineSeries({ color: OxyColors.White, strokeThickness: 1.5 })
  series1.points.push(...lineaPoints)
  model.series.push(series1)
  return model
}

function conwayLife(): PlotModel {
  // http://en.wikipedia.org/wiki/Conway's_Game_of_Life
  const model = new PlotModel({
    title: "Conway's Game of Life",
    subtitle: 'Click the mouse to step to the next generation.',
  })
  model.axes.push(new LinearAxis({ position: AxisPosition.Left, startPosition: 1, endPosition: 0 }))
  model.axes.push(new LinearAxis({ position: AxisPosition.Bottom }))
  const m = 40
  const n = 40
  let matrix = create2DArray(n, m, 0)
  const ms = new MatrixSeries({ matrix: matrix })

  const blinker = (i: number, j: number) => {
    matrix[i][j] = matrix[i][j + 1] = matrix[i][j + 2] = 1
  }
  const glider = (i: number, j: number) => {
    matrix[i][j] = matrix[i + 1][j + 1] = matrix[i + 1][j + 2] = matrix[i + 2][j] = matrix[i + 2][j + 1] = 1
  }
  const rpentomino = (i: number, j: number) => {
    matrix[i][j + 1] = matrix[i][j + 2] = matrix[i + 1][j] = matrix[i + 1][j + 1] = matrix[i + 2][j + 1] = 1
  }

  blinker(2, 10)
  glider(2, 2)
  rpentomino(20, 20)

  model.series.push(ms)
  let g = 0
  const stepToNextGeneration = () => {
    const next = create2DArray(n, m, 0)
    for (let i = 1; i < m - 1; i++) {
      for (let j = 1; j < n - 1; j++) {
        const k =
          matrix[i - 1][j - 1] +
          matrix[i - 1][j] +
          matrix[i - 1][j + 1] +
          matrix[i][j - 1] +
          matrix[i][j + 1] +
          matrix[i + 1][j - 1] +
          matrix[i + 1][j] +
          matrix[i + 1][j + 1]

        if (matrix[i][j] === 0 && k === 3) {
          // Any dead cell with exactly three live neighbours becomes a live cell, as if by reproduction.
          next[i][j] = 1
          continue
        }

        if (matrix[i][j] === 1 && (k === 2 || k === 3)) {
          // Any live cell with two or three live neighbours lives on to the next generation.
          next[i][j] = 1
        }

        // Any live cell with fewer than two live neighbours dies, as if caused by under-population.
        // Any live cell with more than three live neighbours dies, as if by overcrowding.
      }
    }

    g++
    ms.title = 'Generation ' + g
    ms.matrix = matrix = next
    model.invalidatePlot(true)
  }

  model.mouseDown = (s, e) => {
    if (e.changedButton === OxyMouseButton.Left) {
      stepToNextGeneration()
      e.handled = true
    }
  }

  return model
}

function elephantCurve(): PlotModel {
  const sin = Math.sin
  const x = (t: number) => {
    return (
      (-27 / 5) * sin(3 / 2 - 30 * t) -
      (16 / 3) * sin(9 / 8 - 29 * t) -
      (29 / 5) * sin(5 / 4 - 27 * t) -
      (8 / 3) * sin(1 / 4 - 26 * t) -
      (25 / 7) * sin(1 / 3 - 25 * t) -
      (31 / 4) * sin(4 / 7 - 22 * t) -
      (25 / 4) * sin(4 / 3 - 20 * t) -
      (33 / 2) * sin(2 / 3 - 19 * t) -
      (67 / 4) * sin(6 / 5 - 16 * t) -
      (100 / 11) * sin(1 / 4 - 10 * t) -
      (425 / 7) * sin(1 - 4 * t) +
      (149 / 4) * sin(8 * t) +
      (1172 / 3) * sin(t + 21 / 5) +
      (661 / 11) * sin(2 * t + 3) +
      (471 / 8) * sin(3 * t + 10 / 7) +
      (211 / 7) * sin(5 * t + 13 / 4) +
      (39 / 4) * sin(6 * t + 10 / 7) +
      (139 / 10) * sin(7 * t + 7 / 6) +
      (77 / 3) * sin(9 * t + 18 / 7) +
      (135 / 8) * sin(11 * t + 1 / 2) +
      (23 / 4) * sin(12 * t + 8 / 5) +
      (95 / 4) * sin(13 * t + 4) +
      (31 / 4) * sin(14 * t + 3 / 5) +
      (67 / 11) * sin(15 * t + 7 / 3) +
      (127 / 21) * sin(17 * t + 17 / 4) +
      (95 / 8) * sin(18 * t + 7 / 8) +
      (32 / 11) * sin(21 * t + 8 / 3) +
      (81 / 10) * sin(23 * t + 45 / 11) +
      (13 / 3) * sin(24 * t + 13 / 4) +
      (7 / 4) * sin(28 * t + 3 / 2) +
      (11 / 5) * sin(31 * t + 5 / 2) +
      (1 / 3) * sin(32 * t + 12 / 5) +
      (13 / 4) * sin(33 * t + 22 / 5) +
      (14 / 3) * sin(34 * t + 9 / 4) +
      (9 / 5) * sin(35 * t + 8 / 5) +
      (17 / 9) * sin(36 * t + 22 / 5) +
      (1 / 3) * sin(37 * t + 15 / 7) +
      (3 / 2) * sin(38 * t + 39 / 10) +
      (4 / 3) * sin(39 * t + 7 / 2) +
      (5 / 3) * sin(40 * t + 17 / 6)
    )
  }
  const y = (t: number) => {
    return (
      (-13 / 7) * sin(1 / 2 - 40 * t) -
      (31 / 8) * sin(1 / 11 - 34 * t) -
      (12 / 5) * sin(1 / 4 - 31 * t) -
      (9 / 4) * sin(4 / 3 - 29 * t) -
      (5 / 3) * sin(4 / 3 - 28 * t) -
      (11 / 2) * sin(6 / 5 - 26 * t) -
      (17 / 7) * sin(3 / 2 - 25 * t) -
      (5 / 2) * sin(1 - 24 * t) -
      (39 / 7) * sin(1 - 19 * t) -
      (59 / 5) * sin(2 / 3 - 18 * t) -
      (179 / 9) * sin(13 / 12 - 12 * t) -
      (103 / 2) * sin(1 / 10 - 9 * t) -
      (356 / 5) * sin(1 - 5 * t) -
      (429 / 2) * sin(20 / 19 - t) +
      (288 / 5) * sin(2 * t + 10 / 3) +
      (53 / 6) * sin(3 * t + 5 / 2) +
      (351 / 7) * sin(4 * t + 5 / 2) +
      (201 / 4) * sin(6 * t + 17 / 7) +
      (167 / 3) * sin(7 * t + 19 / 5) +
      (323 / 5) * sin(8 * t + 1 / 4) +
      (153 / 7) * sin(10 * t + 2 / 3) +
      (71 / 5) * sin(11 * t + 6 / 5) +
      (47 / 12) * sin(13 * t + 11 / 5) +
      (391 / 26) * sin(14 * t + 2) +
      (164 / 11) * sin(15 * t + 1 / 7) +
      (11 / 2) * sin(16 * t + 2 / 3) +
      (31 / 3) * sin(17 * t + 1 / 7) +
      (54 / 11) * sin(20 * t + 1 / 4) +
      (43 / 5) * sin(21 * t + 13 / 3) +
      (13 / 5) * sin(22 * t + 3 / 2) +
      (17 / 5) * sin(23 * t + 11 / 5) +
      (19 / 10) * sin(27 * t + 4) +
      (15 / 2) * sin(30 * t + 55 / 18) +
      (4 / 3) * sin(32 * t + 3 / 5) +
      (5 / 3) * sin(33 * t + 4) +
      (27 / 7) * sin(35 * t + 13 / 6) +
      (1 / 4) * sin(36 * t + 43 / 11) +
      (16 / 5) * sin(37 * t + 9 / 2) +
      (20 / 19) * sin(38 * t + 23 / 6) +
      (8 / 3) * sin(39 * t + 4 / 7)
    )
  }

  const model = new PlotModel({ title: 'Elephant curve', plotType: PlotType.Cartesian })
  model.series.push(FunctionSeries.fromFxFyN(x, y, 0, Math.PI * 2, 1000))
  return model
}

function piCurve(): PlotModel {
  // http://www.wolframalpha.com/input/?i=pi+curve
  const sin = Math.sin
  const x = (t: number) => {
    return (
      (17 / 31) * sin(235 / 57 - 32 * t) +
      (19 / 17) * sin(192 / 55 - 30 * t) +
      (47 / 32) * sin(69 / 25 - 29 * t) +
      (35 / 26) * sin(75 / 34 - 27 * t) +
      (6 / 31) * sin(23 / 10 - 26 * t) +
      (35 / 43) * sin(10 / 33 - 25 * t) +
      (126 / 43) * sin(421 / 158 - 24 * t) +
      (143 / 57) * sin(35 / 22 - 22 * t) +
      (106 / 27) * sin(84 / 29 - 21 * t) +
      (88 / 25) * sin(23 / 27 - 20 * t) +
      (74 / 27) * sin(53 / 22 - 19 * t) +
      (44 / 53) * sin(117 / 25 - 18 * t) +
      (126 / 25) * sin(88 / 49 - 17 * t) +
      (79 / 11) * sin(43 / 26 - 16 * t) +
      (43 / 12) * sin(41 / 17 - 15 * t) +
      (47 / 27) * sin(244 / 81 - 14 * t) +
      (8 / 5) * sin(79 / 19 - 13 * t) +
      (373 / 46) * sin(109 / 38 - 12 * t) +
      (1200 / 31) * sin(133 / 74 - 11 * t) +
      (67 / 24) * sin(157 / 61 - 10 * t) +
      (583 / 28) * sin(13 / 8 - 8 * t) +
      (772 / 35) * sin(59 / 16 - 7 * t) +
      (3705 / 46) * sin(117 / 50 - 6 * t) +
      (862 / 13) * sin(19 / 8 - 5 * t) +
      (6555 / 34) * sin(157 / 78 - 3 * t) +
      (6949 / 13) * sin(83 / 27 - t) -
      (6805 / 54) * sin(2 * t + 1 / 145) -
      (5207 / 37) * sin(4 * t + 49 / 74) -
      (1811 / 58) * sin(9 * t + 55 / 43) -
      (63 / 20) * sin(23 * t + 2 / 23) -
      (266 / 177) * sin(28 * t + 13 / 18) -
      (2 / 21) * sin(31 * t + 7 / 16)
    )
  }
  const y = (t: number) => {
    return (
      (70 / 37) * sin(65 / 32 - 32 * t) +
      (11 / 12) * sin(98 / 41 - 31 * t) +
      (26 / 29) * sin(35 / 12 - 30 * t) +
      (54 / 41) * sin(18 / 7 - 29 * t) +
      (177 / 71) * sin(51 / 19 - 27 * t) +
      (59 / 34) * sin(125 / 33 - 26 * t) +
      (49 / 29) * sin(18 / 11 - 25 * t) +
      (151 / 75) * sin(59 / 22 - 24 * t) +
      (52 / 9) * sin(118 / 45 - 22 * t) +
      (52 / 33) * sin(133 / 52 - 21 * t) +
      (37 / 45) * sin(61 / 14 - 20 * t) +
      (143 / 46) * sin(144 / 41 - 19 * t) +
      (254 / 47) * sin(19 / 52 - 18 * t) +
      (246 / 35) * sin(92 / 25 - 17 * t) +
      (722 / 111) * sin(176 / 67 - 16 * t) +
      (136 / 23) * sin(3 / 19 - 15 * t) +
      (273 / 25) * sin(32 / 21 - 13 * t) +
      (229 / 33) * sin(117 / 28 - 12 * t) +
      (19 / 4) * sin(43 / 11 - 11 * t) +
      (135 / 8) * sin(23 / 10 - 10 * t) +
      (205 / 6) * sin(33 / 23 - 8 * t) +
      (679 / 45) * sin(55 / 12 - 7 * t) +
      (101 / 8) * sin(11 / 12 - 6 * t) +
      (2760 / 59) * sin(40 / 11 - 5 * t) +
      (1207 / 18) * sin(21 / 23 - 4 * t) +
      (8566 / 27) * sin(39 / 28 - 3 * t) +
      (12334 / 29) * sin(47 / 37 - 2 * t) +
      (15410 / 39) * sin(185 / 41 - t) -
      (596 / 17) * sin(9 * t + 3 / 26) -
      (247 / 28) * sin(14 * t + 25 / 21) -
      (458 / 131) * sin(23 * t + 21 / 37) -
      (41 / 36) * sin(28 * t + 7 / 8)
    )
  }

  const model = new PlotModel({ title: 'PI curve', plotType: PlotType.Cartesian })
  model.series.push(FunctionSeries.fromFxFyN(x, y, 0, Math.PI * 2, 1000))
  return model
}

// ===================
export function numericOdeSolvers(
  title: string,
  subtitle: string,
  t0: number,
  y0: number,
  exact: (x: number) => number,
  f: (x: number, y: number) => number,
): PlotModel {
  const model = new PlotModel({
    title: title,
    subtitle: subtitle,
  })

  const l = new Legend({
    legendPosition: LegendPosition.BottomCenter,
    legendPlacement: LegendPlacement.Outside,
    legendOrientation: LegendOrientation.Horizontal,
  })

  model.legends.push(l)
  const fs = FunctionSeries.fromN(exact, 0, 4, 100)
  Object.assign(fs, { title: 'Exact solution', strokeThickness: 5 })
  model.series.push(fs)
  const eulerSeries = new LineSeries({
    title: 'Euler, h=0.25',
    markerType: MarkerType.Circle,
    markerFill: OxyColors.Black,
  })
  eulerSeries.points.push(...euler(f, t0, y0, 4, 0.25))
  model.series.push(eulerSeries)

  const heunSeries = new LineSeries({
    title: 'Heun, h=0.25',
    markerType: MarkerType.Circle,
    markerFill: OxyColors.Black,
  })
  heunSeries.points.push(...heun(f, t0, y0, 4, 0.25))
  model.series.push(heunSeries)

  const midpointSeries = new LineSeries({
    title: 'Midpoint, h=0.25',
    markerType: MarkerType.Circle,
    markerFill: OxyColors.Black,
  })
  midpointSeries.points.push(...midpoint(f, t0, y0, 4, 0.25))
  model.series.push(midpointSeries)

  const rkSeries = new LineSeries({
    title: 'RK4, h=0.25',
    markerType: MarkerType.Circle,
    markerFill: OxyColors.Black,
  })
  rkSeries.points.push(...rungeKutta4(f, t0, y0, 4, 0.25))
  model.series.push(rkSeries)

  model.axes.push(new LinearAxis({ position: AxisPosition.Left }))
  return model
}

function euler(f: (t: number, y: number) => number, t0: number, y0: number, t1: number, h: number): DataPoint[] {
  const points: DataPoint[] = []
  let y = y0
  for (let t = t0; t < t1 + h / 2; t += h) {
    points.push(newDataPoint(t, y))
    y += h * f(t, y)
  }

  return points
}

function heun(f: (t: number, y: number) => number, t0: number, y0: number, t1: number, h: number): DataPoint[] {
  const points: DataPoint[] = []
  let y = y0
  for (let t = t0; t < t1 + h / 2; t += h) {
    points.push(newDataPoint(t, y))
    const ytilde = y + h * f(t, y)
    y = y + (h / 2) * (f(t, y) + f(t + h, ytilde))
  }

  return points
}

function midpoint(f: (t: number, y: number) => number, t0: number, y0: number, t1: number, h: number): DataPoint[] {
  const points: DataPoint[] = []
  let y = y0
  for (let t = t0; t < t1 + h / 2; t += h) {
    points.push(newDataPoint(t, y))
    y += h * f(t + h / 2, y + (h / 2) * f(t, y))
  }

  return points
}

function rungeKutta4(f: (t: number, y: number) => number, t0: number, y0: number, t1: number, h: number): DataPoint[] {
  const points: DataPoint[] = []
  let y = y0
  for (let t = t0; t < t1 + h / 2; t += h) {
    points.push(newDataPoint(t, y))
    const k1 = h * f(t, y)
    const k2 = h * f(t + h / 2, y + k1 / 2)
    const k3 = h * f(t + h / 2, y + k2 / 2)
    const k4 = h * f(t + h, y + k3)
    y += (k1 + 2 * k2 + 2 * k3 + k4) / 6
  }

  return points
}

class CustomAxis extends LinearAxis {
  constructor(opt?: any) {
    super(opt)
  }

  public majorTicks: number[] = []
  public minorTicks: number[] = []
  public labels: string[] = []

  public getTickValues(): TickValuesType {
    const majorTickValues = this.majorTicks.filter((d) => d >= this.actualMinimum && d <= this.actualMaximum)
    const minorTickValues = this.minorTicks.filter((d) => d >= this.actualMinimum && d <= this.actualMaximum)
    const majorLabelValues = majorTickValues
    return {
      majorTickValues,
      minorTickValues,
      majorLabelValues,
    }
  }

  protected formatValueOverride(x: number): string {
    return this.labels[this.majorTicks.indexOf(x)]
  }
}

const category = 'Misc'

export default {
  category,
  examples: [
    {
      title: "Numeric ODE solvers (y'=y)",
      example: {
        model: numericOdeSolvers1,
      },
    },
    {
      title: "Numeric ODE solvers (y'=x)",
      example: {
        model: numericOdeSolvers2,
      },
    },
    {
      title: "Numeric ODE solvers (y'=cos(x))",
      example: {
        model: numericOdeSolvers3,
      },
    },
    {
      title: 'Train schedule',
      example: {
        model: trainSchedule,
      },
    },
    {
      title: 'La Linea (AreaSeries)',
      example: {
        model: laLineaAreaSeries,
      },
    },
    {
      title: 'La Linea (LineSeries)',
      example: {
        model: laLinea,
      },
    },
    {
      title: "Conway's Game of Life",
      example: {
        model: conwayLife,
      },
    },
    {
      title: 'Elephant curve',
      example: {
        model: elephantCurve,
      },
    },
    {
      title: 'PI curve',
      example: {
        model: piCurve,
      },
    },
  ],
} as ExampleCategory
