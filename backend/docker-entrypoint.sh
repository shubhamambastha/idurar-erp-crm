#!/bin/sh
set -e

echo "Waiting for MongoDB to be ready..."
until node -e "
  const mongoose = require('mongoose');
  mongoose.connect(process.env.DATABASE, { serverSelectionTimeoutMS: 2000 })
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
" 2>/dev/null; do
  echo "MongoDB is unavailable - sleeping"
  sleep 2
done

echo "MongoDB is ready!"

# Check if setup has been run
node -e "
  const mongoose = require('mongoose');
  mongoose.connect(process.env.DATABASE).then(async () => {
    const Admin = require('./src/models/coreModels/Admin');
    const count = await Admin.countDocuments();
    await mongoose.connection.close();
    process.exit(count > 0 ? 0 : 1);
  });
" 2>/dev/null

if [ $? -eq 1 ]; then
  echo "Running initial setup..."
  npm run setup
  echo "Setup completed!"
else
  echo "Setup already done, skipping..."
fi

echo "Starting application..."
exec "$@"