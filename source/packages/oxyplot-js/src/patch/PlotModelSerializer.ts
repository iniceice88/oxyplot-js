import { PlotModel } from '@/oxyplot'
import { newOxyElement } from './OxyElementInstanceProvider'

export class PlotModelSerializer {
  static deserialize(json: string): PlotModel {
    const obj = JSON.parse(json)

    if (obj.axes) {
      obj.axes = deserializeElementArray(obj.axes, 'axes')
    }
    if (obj.series) {
      obj.series = deserializeElementArray(obj.series, 'series')
    }
    if (obj.annotations) {
      obj.annotations = deserializeElementArray(obj.annotations, 'annotations')
    }
    if (obj.legends) {
      obj.legends = deserializeElementArray(obj.legends, 'legends')
    }
    return new PlotModel(obj)
  }
}

function deserializeElementArray(ary: any, eleType: string) {
  if (!Array.isArray(ary)) {
    throw new Error(`${eleType} must be an array`)
  }
  const elements: any[] = []
  for (const ele of ary) {
    const name = ele['__oxy_element_name__']
    if (!name) continue
    delete ele['__oxy_element_name__']
    const instance = newOxyElement(name, ele)
    if (!instance) {
      console.warn('cannot create element: ' + name)
      continue
    }
    elements.push(instance)
  }

  return elements
}
