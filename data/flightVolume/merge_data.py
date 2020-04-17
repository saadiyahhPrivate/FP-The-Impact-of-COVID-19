import pandas as pd
import geopandas as gpd
import json

commercial = pd.read_csv('number-of-commercial-flights.csv')
commercial = commercial.rename(columns={"Number of flights": "commercialFlights", "7-day moving average": "7DayMovingAvg_Commercial"})

allFlights = pd.read_csv('total-number-of-flights.csv')
allFlights = allFlights.rename(columns={"Number of flights": "totalFlights", "7-day moving average": "7DayMovingAvg_Total"})

# merging the two files
mergedData = commercial.merge(allFlights, how='inner', left_on='DateTime', right_on='DateTime')

# calculated field
mergedData['NonCommercialFlights'] = mergedData.apply(lambda row: row.totalFlights - row.commercialFlights, axis = 1)

mergedData.to_json(r'final_flight_data.json', orient='records', lines=True)
