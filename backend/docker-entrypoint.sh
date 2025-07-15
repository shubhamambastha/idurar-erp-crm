#!/bin/sh

echo "Starting backend service..."

# Wait for MongoDB with timeout
COUNTER=0
MAX_TRIES=30

echo "Waiting for MongoDB to be ready..."
while [ $COUNTER -lt $MAX_TRIES ]; do
  if node -e "
    const mongoose = require('mongoose');
    mongoose.connect(process.env.DATABASE, { serverSelectionTimeoutMS: 2000 })
      .then(() => {
        mongoose.connection.close();
        process.exit(0);
      })
      .catch(() => process.exit(1));
  " 2>&1; then
    echo "MongoDB is ready!"
    break
  fi
  
  COUNTER=$((COUNTER+1))
  echo "MongoDB not ready yet... attempt $COUNTER/$MAX_TRIES"
  sleep 2
done

if [ $COUNTER -eq $MAX_TRIES ]; then
  echo "Failed to connect to MongoDB after $MAX_TRIES attempts"
  exit 1
fi

# Check if setup has been run
echo "Checking if initial setup is needed..."
SETUP_CHECK=$(node -e "
  const mongoose = require('mongoose');
  mongoose.connect(process.env.DATABASE).then(async () => {
    try {
      const Admin = require('./src/models/coreModels/Admin');
      const count = await Admin.countDocuments();
      await mongoose.connection.close();
      console.log(count);
    } catch (err) {
      console.log('0');
    }
  }).catch(() => console.log('0'));
" 2>&1)

# Wait for the check to complete
sleep 2

if [ "$SETUP_CHECK" = "0" ]; then
  echo "Running initial setup..."
  npm run setup || {
    echo "Setup failed!"
    exit 1
  }
  echo "Setup completed successfully!"
else
  echo "Setup already completed (found $SETUP_CHECK admin users)"
fi

echo "Starting the application..."
exec "$@"