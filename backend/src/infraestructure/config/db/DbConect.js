import { connect } from 'mongoose';

const DbConect = async () => {
  const uri = process.env.MONGODB_URI || process.env.Mongo_Uri;

  if (!uri) {
    console.error('No MongoDB URI found in environment. Expected MONGODB_URI');
    process.exit(1);
  }

  try {
    const db = await connect(uri, {
    });
    console.log('Connected to database successfully');
    return db;
  } catch (error) {
    console.error('Error connecting to database:', error);
    process.exit(1);
  }
};

DbConect();

export default DbConect;
