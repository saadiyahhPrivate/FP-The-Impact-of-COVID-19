import pandas as pd
import geopandas as gpd
import json
import datetime
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

# with open('final_restrictions_data.json', 'w') as outfile:
#     json.dump(perCountry, outfile)


numericcodes = pd.read_json("codes.json", dtype={'numeric': object})
codes_by_country = {}
for index, row in numericcodes.iterrows():
    codes_by_country[row["alpha_3"]] = str(row["numeric"])

def findid(code):
    # print(code)
    return codes_by_country[code]

# create smaller dataset just for school information,
# whether to pivot by country or date tbd
schooldata =pd.read_excel('OxCGRT_Download_latest_data.xlsx')
schooldata = schooldata.filter(['CountryName', 'CountryCode', 'Date', 'S1_School closing', 'S1_IsGeneral', 'S1_Notes'])
schooldata = schooldata.fillna("0")
schooldata["id"] = ""
for index, row in schooldata.iterrows():
    # print(row["CountryCode"] , " : " , findid(row["CountryCode"]))
    # row["id"] = findid(row["CountryCode"])
    schooldata.at[index,'id'] = findid(row["CountryCode"])

# schooldata.loc[schooldata.id == "690", 'S1_School closing'] = 2
indexNames = schooldata[ schooldata['Date'] < 20200126 ].index
# schooldata['Date'] = schooldata['Date'].apply(lambda x: pd.to_datetime(str(x), format='%Y%m%d'))

# Delete these row indexes from dataFrame
schooldata.drop(indexNames , inplace=True)

schooldata = schooldata.groupby(['Date'])

perCountry = {}
for name, group in schooldata:
    perCountry[name] = group.to_dict(orient='records')


def default(o):
    if isinstance(o, (datetime.date, datetime.datetime)):
        return o.isoformat()

with open('final_school_restrictions.json', 'w') as outfile:
    #
    # return json.dumps(
    #   item,
    #   sort_keys=True,
    #   indent=1,
    #   default=default
    # )
    json.dump(perCountry, outfile)
