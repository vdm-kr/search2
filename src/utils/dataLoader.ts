import { Source, Commodity, CommodityGroup, DataType, Widget } from '../types';

export async function loadSources(): Promise<Source[]> {
  const response = await fetch('/data/sources.json');
  return response.json();
}

export async function loadCommodityGroups(): Promise<CommodityGroup[]> {
  const response = await fetch('/data/commodityGroups.json');
  return response.json();
}

export async function loadCommodities(): Promise<Commodity[]> {
  const response = await fetch('/data/commodities.json');
  return response.json();
}

export async function loadDataTypes(): Promise<DataType[]> {
  const response = await fetch('/data/dataTypes.json');
  return response.json();
}

export async function loadWidgets(): Promise<Widget[]> {
  const response = await fetch('/data/widgets.json');
  return response.json();
}

