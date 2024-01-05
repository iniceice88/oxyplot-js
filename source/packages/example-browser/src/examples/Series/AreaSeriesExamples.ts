import { AreaSeries, AxisPosition, LinearAxis, LineSeries, newDataPoint, OxyColors, PlotModel } from 'oxyplot-js'
import type { ExampleCategory } from '../types'

function defaultStyle(): PlotModel {
  const plotModel1 = new PlotModel({ title: 'AreaSeries with default style' })
  plotModel1.series.push(createExampleAreaSeries())
  return plotModel1
}

function differentColors(): PlotModel {
  const plotModel1 = new PlotModel({ title: 'AreaSeries with different stroke colors' })
  const areaSeries1 = createExampleAreaSeries()
  areaSeries1.color = OxyColors.Red
  areaSeries1.color2 = OxyColors.Blue
  plotModel1.series.push(areaSeries1)
  return plotModel1
}

function crossingLines(): PlotModel {
  const plotModel1 = new PlotModel({ title: 'AreaSeries with crossing lines' })
  const areaSeries1 = new AreaSeries()
  areaSeries1.points.push(newDataPoint(0, 50))
  areaSeries1.points.push(newDataPoint(10, 140))
  areaSeries1.points.push(newDataPoint(20, 60))
  areaSeries1.points2.push(newDataPoint(0, 60))
  areaSeries1.points2.push(newDataPoint(5, 80))
  areaSeries1.points2.push(newDataPoint(20, 70))
  plotModel1.series.push(areaSeries1)
  return plotModel1
}

function trackerFormatString(): PlotModel {
  const model = new PlotModel({ title: 'AreaSeries with custom TrackerFormatString' })

  // the axis titles will be used in the default tracker format string
  model.axes.push(new LinearAxis({ position: AxisPosition.Bottom, title: 'X-axis' }))
  model.axes.push(new LinearAxis({ position: AxisPosition.Left, title: 'Y-axis' }))

  const areaSeries1 = createExampleAreaSeries()
  areaSeries1.title = 'X={2:0.0} Y={4:0.0}'
  // 'X={2:0.0} Y={4:0.0}'
  areaSeries1.trackerStringFormatter = (args) => `X=${args.xValue.toFixed(1)} Y=${args.yValue.toFixed(1)}`
  model.series.push(areaSeries1)
  return model
}

function constantBaseline(): PlotModel {
  const plotModel1 = new PlotModel({
    title: 'AreaSeries with constant baseline',
    subtitle: 'Empty Points2, ConstantY2 = 0 (default)',
  })
  const areaSeries1 = new AreaSeries()
  areaSeries1.points.push(newDataPoint(0, 50))
  areaSeries1.points.push(newDataPoint(10, 140))
  areaSeries1.points.push(newDataPoint(20, 60))
  plotModel1.series.push(areaSeries1)
  return plotModel1
}

function constantBaselineNaN(): PlotModel {
  const plotModel1 = new PlotModel({
    title: 'AreaSeries with constant baseline',
    subtitle: 'Empty Points2, ConstantY2 = NaN',
  })
  const areaSeries1 = new AreaSeries()
  areaSeries1.points.push(newDataPoint(0, 50))
  areaSeries1.points.push(newDataPoint(10, 140))
  areaSeries1.points.push(newDataPoint(20, 60))
  areaSeries1.constantY2 = Number.NaN
  plotModel1.series.push(areaSeries1)
  return plotModel1
}

function constantBaselineItemsSource(): PlotModel {
  const plotModel1 = new PlotModel({
    title: 'AreaSeries with constant baseline',
    subtitle: 'ItemsSource and DataField2 not set, ConstantY2 = -20',
  })
  const areaSeries1 = new AreaSeries()
  const points = [newDataPoint(0, 50), newDataPoint(10, 140), newDataPoint(20, 60)]
  areaSeries1.itemsSource = points
  areaSeries1.dataFieldX = 'x'
  areaSeries1.dataFieldY = 'y'
  areaSeries1.constantY2 = -20
  plotModel1.series.push(areaSeries1)
  return plotModel1
}

/** LineSeries and AreaSeries */
function lineSeriesAndAreaSeries(): PlotModel {
  const plotModel1 = new PlotModel({ title: 'LineSeries and AreaSeries' })
  const linearAxis1 = new LinearAxis({ position: AxisPosition.Bottom })
  plotModel1.axes.push(linearAxis1)
  const linearAxis2 = new LinearAxis()
  plotModel1.axes.push(linearAxis2)
  const areaSeries1 = new AreaSeries({
    fill: OxyColors.LightBlue,
    dataFieldX2: 'Time',
    dataFieldY2: 'Minimum',
    color: OxyColors.Red,
    strokeThickness: 0,
    markerFill: OxyColors.Transparent,
    dataFieldX: 'Time',
    dataFieldY: 'Maximum',
  })
  areaSeries1.points2.push(newDataPoint(0, -5.04135905692417))
  areaSeries1.points2.push(newDataPoint(2.5, -4.91731850813018))
  areaSeries1.points2.push(newDataPoint(5, -4.45266314658926))
  areaSeries1.points2.push(newDataPoint(7.5, -3.87303874542613))
  areaSeries1.points2.push(newDataPoint(10, -3.00101110255393))
  areaSeries1.points2.push(newDataPoint(12.5, -2.17980725503518))
  areaSeries1.points2.push(newDataPoint(15, -1.67332229254456))
  areaSeries1.points2.push(newDataPoint(17.5, -1.10537158549082))
  areaSeries1.points2.push(newDataPoint(20, -0.6145459544447))
  areaSeries1.points2.push(newDataPoint(22.5, 0.120028106039404))
  areaSeries1.points2.push(newDataPoint(25, 1.06357270435597))
  areaSeries1.points2.push(newDataPoint(27.5, 1.87301405606466))
  areaSeries1.points2.push(newDataPoint(30, 2.57569854952195))
  areaSeries1.points2.push(newDataPoint(32.5, 3.59165537664278))
  areaSeries1.points2.push(newDataPoint(35, 4.87991958133872))
  areaSeries1.points2.push(newDataPoint(37.5, 6.36214537958714))
  areaSeries1.points2.push(newDataPoint(40, 7.62564585126268))
  areaSeries1.points2.push(newDataPoint(42.5, 8.69606320261772))
  areaSeries1.points2.push(newDataPoint(45, 10.0118704438265))
  areaSeries1.points2.push(newDataPoint(47.5, 11.0434480519236))
  areaSeries1.points2.push(newDataPoint(50, 11.9794171576758))
  areaSeries1.points2.push(newDataPoint(52.5, 12.9591851832621))
  areaSeries1.points2.push(newDataPoint(55, 14.172107889304))
  areaSeries1.points2.push(newDataPoint(57.5, 15.5520057698488))
  areaSeries1.points2.push(newDataPoint(60, 17.2274942386092))
  areaSeries1.points2.push(newDataPoint(62.5, 18.6983982186757))
  areaSeries1.points2.push(newDataPoint(65, 20.4560332001448))
  areaSeries1.points2.push(newDataPoint(67.5, 22.4867327382261))
  areaSeries1.points2.push(newDataPoint(70, 24.5319674302041))
  areaSeries1.points2.push(newDataPoint(72.5, 26.600547815813))
  areaSeries1.points2.push(newDataPoint(75, 28.5210891459701))
  areaSeries1.points2.push(newDataPoint(77.5, 30.6793080755413))
  areaSeries1.points2.push(newDataPoint(80, 33.0546651200646))
  areaSeries1.points2.push(newDataPoint(82.5, 35.3256065179713))
  areaSeries1.points2.push(newDataPoint(85, 37.6336074839968))
  areaSeries1.points2.push(newDataPoint(87.5, 40.2012266359763))
  areaSeries1.points2.push(newDataPoint(90, 42.8923555399256))
  areaSeries1.points2.push(newDataPoint(92.5, 45.8665211907432))
  areaSeries1.points2.push(newDataPoint(95, 48.8200195945427))
  areaSeries1.points2.push(newDataPoint(97.5, 51.8304284402311))
  areaSeries1.points2.push(newDataPoint(100, 54.6969868542147))
  areaSeries1.points2.push(newDataPoint(102.5, 57.7047292990632))
  areaSeries1.points2.push(newDataPoint(105, 60.4216644602929))
  areaSeries1.points2.push(newDataPoint(107.5, 62.926258762519))
  areaSeries1.points2.push(newDataPoint(110, 65.1829734629407))
  areaSeries1.points2.push(newDataPoint(112.5, 67.2365592083133))
  areaSeries1.points2.push(newDataPoint(115, 69.5713628691022))
  areaSeries1.points2.push(newDataPoint(117.5, 71.7267046705944))
  areaSeries1.points2.push(newDataPoint(120, 73.633463102781))
  areaSeries1.points2.push(newDataPoint(122.5, 75.4660150158061))
  areaSeries1.points2.push(newDataPoint(125, 77.5669292504745))
  areaSeries1.points2.push(newDataPoint(127.5, 79.564218544664))
  areaSeries1.points2.push(newDataPoint(130, 81.8631309028078))
  areaSeries1.points2.push(newDataPoint(132.5, 83.9698189969034))
  areaSeries1.points2.push(newDataPoint(135, 86.3847886532009))
  areaSeries1.points2.push(newDataPoint(137.5, 88.5559348267764))
  areaSeries1.points2.push(newDataPoint(140, 91.0455050418365))
  areaSeries1.points2.push(newDataPoint(142.5, 93.6964157585504))
  areaSeries1.points2.push(newDataPoint(145, 96.284336864941))
  areaSeries1.points2.push(newDataPoint(147.5, 98.7508602689723))
  areaSeries1.points2.push(newDataPoint(150, 100.904510594255))
  areaSeries1.points2.push(newDataPoint(152.5, 103.266136681506))
  areaSeries1.points2.push(newDataPoint(155, 105.780951269521))
  areaSeries1.points2.push(newDataPoint(157.5, 108.032859257065))
  areaSeries1.points2.push(newDataPoint(160, 110.035478448093))
  areaSeries1.points2.push(newDataPoint(162.5, 112.10655731615))
  areaSeries1.points2.push(newDataPoint(165, 114.37480786097))
  areaSeries1.points2.push(newDataPoint(167.5, 116.403992550869))
  areaSeries1.points2.push(newDataPoint(170, 118.61663988727))
  areaSeries1.points2.push(newDataPoint(172.5, 120.538730287384))
  areaSeries1.points2.push(newDataPoint(175, 122.515721057177))
  areaSeries1.points2.push(newDataPoint(177.5, 124.474386629124))
  areaSeries1.points2.push(newDataPoint(180, 126.448283293214))
  areaSeries1.points2.push(newDataPoint(182.5, 128.373811322299))
  areaSeries1.points2.push(newDataPoint(185, 130.33627914667))
  areaSeries1.points2.push(newDataPoint(187.5, 132.487933658477))
  areaSeries1.points2.push(newDataPoint(190, 134.716989778456))
  areaSeries1.points2.push(newDataPoint(192.5, 136.817287595392))
  areaSeries1.points2.push(newDataPoint(195, 139.216488664698))
  areaSeries1.points2.push(newDataPoint(197.5, 141.50803227574))
  areaSeries1.points2.push(newDataPoint(200, 143.539586683614))
  areaSeries1.points2.push(newDataPoint(202.5, 145.535911545221))
  areaSeries1.points2.push(newDataPoint(205, 147.516964978686))
  areaSeries1.points2.push(newDataPoint(207.5, 149.592416731684))
  areaSeries1.points2.push(newDataPoint(210, 151.600983566512))
  areaSeries1.points2.push(newDataPoint(212.5, 153.498210993362))
  areaSeries1.points2.push(newDataPoint(215, 155.512606828247))
  areaSeries1.points2.push(newDataPoint(217.5, 157.426564302774))
  areaSeries1.points2.push(newDataPoint(220, 159.364474964172))
  areaSeries1.points2.push(newDataPoint(222.5, 161.152806492128))
  areaSeries1.points2.push(newDataPoint(225, 162.679069434562))
  areaSeries1.points2.push(newDataPoint(227.5, 163.893622036741))
  areaSeries1.points2.push(newDataPoint(230, 165.475827621238))
  areaSeries1.points2.push(newDataPoint(232.5, 167.303960444734))
  areaSeries1.points2.push(newDataPoint(235, 169.259393394952))
  areaSeries1.points2.push(newDataPoint(237.5, 171.265193646758))
  areaSeries1.points2.push(newDataPoint(240, 173.074304345192))
  areaSeries1.points2.push(newDataPoint(242.5, 174.975492766814))
  areaSeries1.points2.push(newDataPoint(245, 176.684088218484))
  areaSeries1.points2.push(newDataPoint(247.5, 178.406887247603))

  areaSeries1.points.push(newDataPoint(0, 5.0184649433561))
  areaSeries1.points.push(newDataPoint(2.5, 5.27685959268215))
  areaSeries1.points.push(newDataPoint(5, 5.81437064628786))
  areaSeries1.points.push(newDataPoint(7.5, 6.51022475040994))
  areaSeries1.points.push(newDataPoint(10, 7.49921246878766))
  areaSeries1.points.push(newDataPoint(12.5, 8.41941631823751))
  areaSeries1.points.push(newDataPoint(15, 9.09826907222079))
  areaSeries1.points.push(newDataPoint(17.5, 9.89500750098145))
  areaSeries1.points.push(newDataPoint(20, 10.6633345249404))
  areaSeries1.points.push(newDataPoint(22.5, 11.6249613445368))
  areaSeries1.points.push(newDataPoint(25, 12.8816391467497))
  areaSeries1.points.push(newDataPoint(27.5, 13.9665185705603))
  areaSeries1.points.push(newDataPoint(30, 14.8501816818724))
  areaSeries1.points.push(newDataPoint(32.5, 16.0683128022441))
  areaSeries1.points.push(newDataPoint(35, 17.5378799723172))
  areaSeries1.points.push(newDataPoint(37.5, 19.1262752954039))
  areaSeries1.points.push(newDataPoint(40, 20.4103953650735))
  areaSeries1.points.push(newDataPoint(42.5, 21.5430627723891))
  areaSeries1.points.push(newDataPoint(45, 22.9105459463366))
  areaSeries1.points.push(newDataPoint(47.5, 23.9802361888719))
  areaSeries1.points.push(newDataPoint(50, 24.8659461235003))
  areaSeries1.points.push(newDataPoint(52.5, 25.7303194442439))
  areaSeries1.points.push(newDataPoint(55, 26.7688545912359))
  areaSeries1.points.push(newDataPoint(57.5, 28.0545112571933))
  areaSeries1.points.push(newDataPoint(60, 29.7036634266394))
  areaSeries1.points.push(newDataPoint(62.5, 31.2273634344467))
  areaSeries1.points.push(newDataPoint(65, 33.1038196356519))
  areaSeries1.points.push(newDataPoint(67.5, 35.2639893610328))
  areaSeries1.points.push(newDataPoint(70, 37.434293559489))
  areaSeries1.points.push(newDataPoint(72.5, 39.7109359368267))
  areaSeries1.points.push(newDataPoint(75, 41.7573881676222))
  areaSeries1.points.push(newDataPoint(77.5, 44.0460374479862))
  areaSeries1.points.push(newDataPoint(80, 46.5098714746581))
  areaSeries1.points.push(newDataPoint(82.5, 48.7754012129155))
  areaSeries1.points.push(newDataPoint(85, 51.1619816926597))
  areaSeries1.points.push(newDataPoint(87.5, 53.9036778414639))
  areaSeries1.points.push(newDataPoint(90, 56.7448825012636))
  areaSeries1.points.push(newDataPoint(92.5, 59.9294987878434))
  areaSeries1.points.push(newDataPoint(95, 63.0148831289797))
  areaSeries1.points.push(newDataPoint(97.5, 66.0721745989622))
  areaSeries1.points.push(newDataPoint(100, 68.8980036274521))
  areaSeries1.points.push(newDataPoint(102.5, 71.7719322611447))
  areaSeries1.points.push(newDataPoint(105, 74.4206055336728))
  areaSeries1.points.push(newDataPoint(107.5, 76.816198386632))
  areaSeries1.points.push(newDataPoint(110, 79.0040432726983))
  areaSeries1.points.push(newDataPoint(112.5, 80.9617606926066))
  areaSeries1.points.push(newDataPoint(115, 83.1345574620341))
  areaSeries1.points.push(newDataPoint(117.5, 85.0701022046479))
  areaSeries1.points.push(newDataPoint(120, 86.8557530286516))
  areaSeries1.points.push(newDataPoint(122.5, 88.5673387745243))
  areaSeries1.points.push(newDataPoint(125, 90.6003321543338))
  areaSeries1.points.push(newDataPoint(127.5, 92.439864576254))
  areaSeries1.points.push(newDataPoint(130, 94.5383744861178))
  areaSeries1.points.push(newDataPoint(132.5, 96.4600166864507))
  areaSeries1.points.push(newDataPoint(135, 98.6091052949006))
  areaSeries1.points.push(newDataPoint(137.5, 100.496459351478))
  areaSeries1.points.push(newDataPoint(140, 102.705767030085))
  areaSeries1.points.push(newDataPoint(142.5, 105.009994476992))
  areaSeries1.points.push(newDataPoint(145, 107.31287026052))
  areaSeries1.points.push(newDataPoint(147.5, 109.584842542272))
  areaSeries1.points.push(newDataPoint(150, 111.641435600837))
  areaSeries1.points.push(newDataPoint(152.5, 113.988459973544))
  areaSeries1.points.push(newDataPoint(155, 116.50349048027))
  areaSeries1.points.push(newDataPoint(157.5, 118.753612704274))
  areaSeries1.points.push(newDataPoint(160, 120.801728924085))
  areaSeries1.points.push(newDataPoint(162.5, 122.902486914165))
  areaSeries1.points.push(newDataPoint(165, 125.104391935796))
  areaSeries1.points.push(newDataPoint(167.5, 127.06056966547))
  areaSeries1.points.push(newDataPoint(170, 129.217086578495))
  areaSeries1.points.push(newDataPoint(172.5, 131.151968896274))
  areaSeries1.points.push(newDataPoint(175, 133.159906275133))
  areaSeries1.points.push(newDataPoint(177.5, 135.065263957561))
  areaSeries1.points.push(newDataPoint(180, 137.041870026822))
  areaSeries1.points.push(newDataPoint(182.5, 138.937477489811))
  areaSeries1.points.push(newDataPoint(185, 140.776914926282))
  areaSeries1.points.push(newDataPoint(187.5, 142.786975776398))
  areaSeries1.points.push(newDataPoint(190, 144.862762377347))
  areaSeries1.points.push(newDataPoint(192.5, 146.89654967049))
  areaSeries1.points.push(newDataPoint(195, 149.204343821204))
  areaSeries1.points.push(newDataPoint(197.5, 151.369748673527))
  areaSeries1.points.push(newDataPoint(200, 153.324438580137))
  areaSeries1.points.push(newDataPoint(202.5, 155.173148715344))
  areaSeries1.points.push(newDataPoint(205, 157.0501827528))
  areaSeries1.points.push(newDataPoint(207.5, 159.109122278359))
  areaSeries1.points.push(newDataPoint(210, 161.044446932778))
  areaSeries1.points.push(newDataPoint(212.5, 162.942364031841))
  areaSeries1.points.push(newDataPoint(215, 164.966769883021))
  areaSeries1.points.push(newDataPoint(217.5, 166.89711806788))
  areaSeries1.points.push(newDataPoint(220, 168.906874949069))
  areaSeries1.points.push(newDataPoint(222.5, 170.85692034995))
  areaSeries1.points.push(newDataPoint(225, 172.602125010408))
  areaSeries1.points.push(newDataPoint(227.5, 173.964258466598))
  areaSeries1.points.push(newDataPoint(230, 175.629908385654))
  areaSeries1.points.push(newDataPoint(232.5, 177.495778359378))
  areaSeries1.points.push(newDataPoint(235, 179.432933300749))
  areaSeries1.points.push(newDataPoint(237.5, 181.400180771342))
  areaSeries1.points.push(newDataPoint(240, 183.232300309899))
  areaSeries1.points.push(newDataPoint(242.5, 185.225502661441))
  areaSeries1.points.push(newDataPoint(245, 186.979590140413))
  areaSeries1.points.push(newDataPoint(247.5, 188.816640077725))
  areaSeries1.title = 'Maximum/Minimum'
  plotModel1.series.push(areaSeries1)

  const lineSeries1 = new LineSeries({
    color: OxyColors.Blue,
    markerFill: OxyColors.Transparent,
    dataFieldX: 'Time',
    dataFieldY: 'Value',
  })
  lineSeries1.points.push(newDataPoint(0, -0.011447056784037))
  lineSeries1.points.push(newDataPoint(2.5, 0.179770542275985))
  lineSeries1.points.push(newDataPoint(5, 0.6808537498493))
  lineSeries1.points.push(newDataPoint(7.5, 1.31859300249191))
  lineSeries1.points.push(newDataPoint(10, 2.24910068311687))
  lineSeries1.points.push(newDataPoint(12.5, 3.11980453160117))
  lineSeries1.points.push(newDataPoint(15, 3.71247338983811))
  lineSeries1.points.push(newDataPoint(17.5, 4.39481795774531))
  lineSeries1.points.push(newDataPoint(20, 5.02439428524784))
  lineSeries1.points.push(newDataPoint(22.5, 5.87249472528812))
  lineSeries1.points.push(newDataPoint(25, 6.97260592555283))
  lineSeries1.points.push(newDataPoint(27.5, 7.91976631331247))
  lineSeries1.points.push(newDataPoint(30, 8.71294011569719))
  lineSeries1.points.push(newDataPoint(32.5, 9.82998408944345))
  lineSeries1.points.push(newDataPoint(35, 11.208899776828))
  lineSeries1.points.push(newDataPoint(37.5, 12.7442103374955))
  lineSeries1.points.push(newDataPoint(40, 14.0180206081681))
  lineSeries1.points.push(newDataPoint(42.5, 15.1195629875034))
  lineSeries1.points.push(newDataPoint(45, 16.4612081950815))
  lineSeries1.points.push(newDataPoint(47.5, 17.5118421203978))
  lineSeries1.points.push(newDataPoint(50, 18.4226816405881))
  lineSeries1.points.push(newDataPoint(52.5, 19.344752313753))
  lineSeries1.points.push(newDataPoint(55, 20.47048124027))
  lineSeries1.points.push(newDataPoint(57.5, 21.8032585135211))
  lineSeries1.points.push(newDataPoint(60, 23.4655788326243))
  lineSeries1.points.push(newDataPoint(62.5, 24.9628808265612))
  lineSeries1.points.push(newDataPoint(65, 26.7799264178984))
  lineSeries1.points.push(newDataPoint(67.5, 28.8753610496295))
  lineSeries1.points.push(newDataPoint(70, 30.9831304948466))
  lineSeries1.points.push(newDataPoint(72.5, 33.1557418763199))
  lineSeries1.points.push(newDataPoint(75, 35.1392386567962))
  lineSeries1.points.push(newDataPoint(77.5, 37.3626727617638))
  lineSeries1.points.push(newDataPoint(80, 39.7822682973613))
  lineSeries1.points.push(newDataPoint(82.5, 42.0505038654434))
  lineSeries1.points.push(newDataPoint(85, 44.3977945883283))
  lineSeries1.points.push(newDataPoint(87.5, 47.0524522387201))
  lineSeries1.points.push(newDataPoint(90, 49.8186190205946))
  lineSeries1.points.push(newDataPoint(92.5, 52.8980099892933))
  lineSeries1.points.push(newDataPoint(95, 55.9174513617612))
  lineSeries1.points.push(newDataPoint(97.5, 58.9513015195966))
  lineSeries1.points.push(newDataPoint(100, 61.7974952408334))
  lineSeries1.points.push(newDataPoint(102.5, 64.738330780104))
  lineSeries1.points.push(newDataPoint(105, 67.4211349969828))
  lineSeries1.points.push(newDataPoint(107.5, 69.8712285745755))
  lineSeries1.points.push(newDataPoint(110, 72.0935083678195))
  lineSeries1.points.push(newDataPoint(112.5, 74.0991599504599))
  lineSeries1.points.push(newDataPoint(115, 76.3529601655682))
  lineSeries1.points.push(newDataPoint(117.5, 78.3984034376212))
  lineSeries1.points.push(newDataPoint(120, 80.2446080657163))
  lineSeries1.points.push(newDataPoint(122.5, 82.0166768951652))
  lineSeries1.points.push(newDataPoint(125, 84.0836307024042))
  lineSeries1.points.push(newDataPoint(127.5, 86.002041560459))
  lineSeries1.points.push(newDataPoint(130, 88.2007526944628))
  lineSeries1.points.push(newDataPoint(132.5, 90.2149178416771))
  lineSeries1.points.push(newDataPoint(135, 92.4969469740507))
  lineSeries1.points.push(newDataPoint(137.5, 94.5261970891274))
  lineSeries1.points.push(newDataPoint(140, 96.875636035961))
  lineSeries1.points.push(newDataPoint(142.5, 99.3532051177711))
  lineSeries1.points.push(newDataPoint(145, 101.798603562731))
  lineSeries1.points.push(newDataPoint(147.5, 104.167851405622))
  lineSeries1.points.push(newDataPoint(150, 106.272973097546))
  lineSeries1.points.push(newDataPoint(152.5, 108.627298327525))
  lineSeries1.points.push(newDataPoint(155, 111.142220874895))
  lineSeries1.points.push(newDataPoint(157.5, 113.39323598067))
  lineSeries1.points.push(newDataPoint(160, 115.418603686089))
  lineSeries1.points.push(newDataPoint(162.5, 117.504522115157))
  lineSeries1.points.push(newDataPoint(165, 119.739599898383))
  lineSeries1.points.push(newDataPoint(167.5, 121.732281108169))
  lineSeries1.points.push(newDataPoint(170, 123.916863232882))
  lineSeries1.points.push(newDataPoint(172.5, 125.845349591829))
  lineSeries1.points.push(newDataPoint(175, 127.837813666155))
  lineSeries1.points.push(newDataPoint(177.5, 129.769825293343))
  lineSeries1.points.push(newDataPoint(180, 131.745076660018))
  lineSeries1.points.push(newDataPoint(182.5, 133.655644406055))
  lineSeries1.points.push(newDataPoint(185, 135.556597036476))
  lineSeries1.points.push(newDataPoint(187.5, 137.637454717438))
  lineSeries1.points.push(newDataPoint(190, 139.789876077902))
  lineSeries1.points.push(newDataPoint(192.5, 141.856918632941))
  lineSeries1.points.push(newDataPoint(195, 144.210416242951))
  lineSeries1.points.push(newDataPoint(197.5, 146.438890474634))
  lineSeries1.points.push(newDataPoint(200, 148.432012631876))
  lineSeries1.points.push(newDataPoint(202.5, 150.354530130282))
  lineSeries1.points.push(newDataPoint(205, 152.283573865743))
  lineSeries1.points.push(newDataPoint(207.5, 154.350769505022))
  lineSeries1.points.push(newDataPoint(210, 156.322715249645))
  lineSeries1.points.push(newDataPoint(212.5, 158.220287512602))
  lineSeries1.points.push(newDataPoint(215, 160.239688355634))
  lineSeries1.points.push(newDataPoint(217.5, 162.161841185327))
  lineSeries1.points.push(newDataPoint(220, 164.135674956621))
  lineSeries1.points.push(newDataPoint(222.5, 166.004863421039))
  lineSeries1.points.push(newDataPoint(225, 167.640597222485))
  lineSeries1.points.push(newDataPoint(227.5, 168.928940251669))
  lineSeries1.points.push(newDataPoint(230, 170.552868003446))
  lineSeries1.points.push(newDataPoint(232.5, 172.399869402056))
  lineSeries1.points.push(newDataPoint(235, 174.346163347851))
  lineSeries1.points.push(newDataPoint(237.5, 176.33268720905))
  lineSeries1.points.push(newDataPoint(240, 178.153302327545))
  lineSeries1.points.push(newDataPoint(242.5, 180.100497714128))
  lineSeries1.points.push(newDataPoint(245, 181.831839179449))
  lineSeries1.points.push(newDataPoint(247.5, 183.611763662664))

  lineSeries1.title = 'Average'
  plotModel1.series.push(lineSeries1)
  return plotModel1
}

// =====================

function createExampleAreaSeries(): AreaSeries {
  const areaSeries1 = new AreaSeries()
  areaSeries1.points.push(newDataPoint(0, 50))
  areaSeries1.points.push(newDataPoint(10, 40))
  areaSeries1.points.push(newDataPoint(20, 60))
  areaSeries1.points2.push(newDataPoint(0, 60))
  areaSeries1.points2.push(newDataPoint(5, 80))
  areaSeries1.points2.push(newDataPoint(20, 70))
  return areaSeries1
}

const category = 'AreaSeries'

export default {
  category,
  tags: ['Series'],
  examples: [
    {
      title: 'Default style',
      example: {
        model: defaultStyle,
      },
    },
    {
      title: 'Different stroke colors',
      example: {
        model: differentColors,
      },
    },
    {
      title: 'Crossing lines',
      example: {
        model: crossingLines,
      },
    },
    {
      title: 'Custom TrackerFormatString',
      example: {
        model: trackerFormatString,
      },
    },
    {
      title: 'Constant baseline (empty Points2)',
      example: {
        model: constantBaseline,
      },
    },
    {
      title: 'Constant baseline (empty Points2, ConstantY2=NaN)',
      example: {
        model: constantBaselineNaN,
      },
    },
    {
      title: 'Constant baseline (ItemsSource and DataField2 not set)',
      example: {
        model: constantBaselineItemsSource,
      },
    },
    {
      title: 'LineSeries and AreaSeries',
      example: {
        model: lineSeriesAndAreaSeries,
      },
    },
  ],
} as ExampleCategory
