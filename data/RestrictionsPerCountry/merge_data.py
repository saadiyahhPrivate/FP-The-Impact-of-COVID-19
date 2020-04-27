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
byDate = {}
for date, data in schooldata:
    byDate[date] = []

# print(byDate)

perCountry = {}
for name, group in schooldata:
    perCountry[name] = group.to_dict(orient='records')


def default(o):
    if isinstance(o, (datetime.date, datetime.datetime)):
        return o.isoformat()

# with open('final_school_restrictions.json', 'w') as outfile:
#     #
#     # return json.dumps(
#     #   item,
#     #   sort_keys=True,
#     #   indent=1,
#     #   default=default
#     # )
#     json.dump(perCountry, outfile)



schooldata =pd.read_excel('OxCGRT_Download_latest_data.xlsx')
schooldata = schooldata.filter(['CountryName', 'CountryCode', 'Date', 'S1_School closing'])
# schooldata.loc[schooldata.id == "690", 'S1_School closing'] = 2
indexNames = schooldata[ schooldata['Date'] < 20200126 ].index
# schooldata['Date'] = schooldata['Date'].apply(lambda x: pd.to_datetime(str(x), format='%Y%m%d'))

# Delete these row indexes from dataFrame
schooldata.drop(indexNames , inplace=True)
schooldata["id"] = ""
for index, row in schooldata.iterrows():
    schooldata.at[index,'id'] = findid(row["CountryCode"])

schooldata = schooldata.sort_values(by='Date', ascending=False)

schooldata = schooldata.dropna(subset=['S1_School closing'])
grouped_data = schooldata.groupby(['CountryName'])

perCountry = {}
for name, group in grouped_data:
    perCountry[name] = []

all_countries = perCountry.keys()

grouped_data = schooldata.groupby(['Date'])
for date, group in grouped_data:
    seen_countries = []
    for row_index, row in group.iterrows():
        seen_countries.append(row['CountryName'])

        curr_data = perCountry[row['CountryName']]
        preferred_value = 0.0
        if (len(curr_data) != 0):
            preferred_value = curr_data[-1]['S1_School closing']
            if (int(curr_data[-1]['Date']) == int(date)):
                # should not add this row, move on
                continue

        if int(row['S1_School closing']) >= int(preferred_value):
            perCountry[row['CountryName']].append({'CountryName': row['CountryName'], 'CountryCode': row['CountryCode'], 'Date': date, 'id': row['id'], 'S1_School closing': min(3,int(row['S1_School closing']))})
        else:
            perCountry[row['CountryName']].append({'CountryName': row['CountryName'], 'CountryCode': row['CountryCode'], 'Date': date, 'id': row['id'], 'S1_School closing': int(preferred_value)})

    # now loop through for countries that do not have an entry
    for country in all_countries:
        if country not in seen_countries:
            if len(perCountry[country]):
                # try and add a row for it with same value as previous
                perCountry[country].append(
                    {'CountryName': str(perCountry[country][-1]['CountryName']),
                    'CountryCode': str(perCountry[country][-1]['CountryCode']),
                    'Date': date,
                    'id': perCountry[country][-1]['id'],
                    'S1_School closing': perCountry[country][-1]['S1_School closing']})

# new we flatten the data and group by date
for country, data in perCountry.items():
    for row in data:
        byDate[row["Date"]].append(row)

with open('final_school_restrictions.json', 'w') as fp:
    json.dump(byDate, fp)
