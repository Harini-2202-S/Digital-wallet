import pandas as pd
from pymongo import MongoClient

df = pd.read_csv('C:/Users/Harini/Documents/VIT/MY_PROJECT/digital-wallet/dataset/digital_wallet_transactions.csv')

df.drop_duplicates(subset=['transaction_id'], keep='first', inplace=True)

client = MongoClient('mongodb://localhost:27017/')

db = client['digital_wallet']

collection = db['transactions']

if not df.empty:
    data = df.to_dict(orient='records')
    collection.insert_many(data)
    print("✅ Data imported successfully!")
else:
    print("⚠️ No data to import!")

