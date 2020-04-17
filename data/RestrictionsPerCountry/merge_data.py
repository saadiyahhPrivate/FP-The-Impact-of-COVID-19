import pandas as pd
import geopandas as gpd
import json

data = pd.read_excel('OxCGRT_Download_latest_data.xlsx')
data = data.drop(columns=['Unnamed: 34'])

# TBD: handle null values
# data = data.dropna(subset=['StringencyIndex'])
data = data.fillna("null")

countries = data.groupby(['CountryName'])

perCountry = {}
for name, group in countries:
    perCountry[name] = group.to_dict(orient='records')

with open('final_restrictions_data.json', 'w') as outfile:
    json.dump(perCountry, outfile)



# create smaller dataset just for school information,
# whether to pivot by country or date tbd
schooldata =pd.read_excel('OxCGRT_Download_latest_data.xlsx')
schooldata = schooldata.filter(['CountryName', 'CountryCode', 'Date', 'S1_School closing', 'S1_IsGeneral', 'S1_Notes'])
schooldata = schooldata.fillna("")
schooldata = schooldata.groupby(['CountryName'])

perCountry = {}
for name, group in schooldata:
    perCountry[name] = group.to_dict(orient='records')

with open('final_school_restrictions.json', 'w') as outfile:
    json.dump(perCountry, outfile)
