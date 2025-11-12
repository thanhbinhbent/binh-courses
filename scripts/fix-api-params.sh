#!/bin/bash

echo "Fixing Next.js 15 API params issues..."

# Step 1: Fix type definitions
echo "Step 1: Updating type definitions..."
find app/api -name "*.ts" -exec sed -i '' 's/{ params }: { params: { \([^}]*\) } }/{ params }: { params: Promise<{ \1 }> }/g' {} \;

# Step 2: Fix destructuring
echo "Step 2: Fixing destructuring patterns..."
find app/api -name "*.ts" -exec sed -i '' 's/const { \([^}]*\) } = params/const { \1 } = await params/g' {} \;

echo "Done fixing API params"