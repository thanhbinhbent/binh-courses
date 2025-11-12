#!/bin/bash

echo "Updating API authentication logic..."

# Remove old instructor role checks
find app/api -name "*.ts" -exec sed -i '' 's/user\.globalRole !== "INSTRUCTOR"/false/g' {} \;
find app/api -name "*.ts" -exec sed -i '' 's/user\.globalRole === "INSTRUCTOR"/false/g' {} \;
find app/api -name "*.ts" -exec sed -i '' 's/user\.globalRole !== "ADMIN"/user.globalRole !== "SYSTEM_ADMIN"/g' {} \;
find app/api -name "*.ts" -exec sed -i '' 's/user\.globalRole === "ADMIN"/user.globalRole === "SYSTEM_ADMIN"/g' {} \;

# Replace instructor-specific error messages
find app/api -name "*.ts" -exec sed -i '' 's/Forbidden - Instructor access required/Forbidden - System admin access required/g' {} \;
find app/api -name "*.ts" -exec sed -i '' 's/Only instructors can/Only system admins can/g' {} \;

echo "Done updating authentication logic"