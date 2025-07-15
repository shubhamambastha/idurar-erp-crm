#!/bin/bash

echo "Checking Docker services health..."

# Check if MongoDB is running and healthy
echo -n "MongoDB: "
docker exec idurar-mongodb mongosh --eval "db.adminCommand('ping')" --quiet > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo "✓ Healthy"
else
    echo "✗ Not responding"
fi

# Check MongoDB connectivity from host
echo -n "MongoDB from host: "
mongosh "mongodb://admin:admin123@localhost:27017/idurar?authSource=admin" --eval "db.adminCommand('ping')" --quiet > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo "✓ Accessible"
else
    echo "✗ Not accessible"
fi

# Check container network
echo -e "\nContainer Network Status:"
docker network inspect idurar-erp-crm_idurar-network --format '{{range .Containers}}{{.Name}}: {{.IPv4Address}}{{println}}{{end}}'

# Show container status
echo -e "\nContainer Status:"
docker-compose ps

# Test MongoDB connection from NestJS container
echo -e "\nTesting MongoDB connection from NestJS container:"
docker exec idurar-nest-integration-api sh -c 'wget -qO- mongodb:27017 2>&1 | head -n1' || echo "Connection test failed"

# Show recent NestJS logs
echo -e "\nRecent NestJS logs:"
docker logs idurar-nest-integration-api --tail 10