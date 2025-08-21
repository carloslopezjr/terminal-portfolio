# Dockerfile - serve the static portfolio with nginx
FROM nginx:alpine

# Copy site files into nginx html directory. Do NOT append a mount-mode suffix like ":ro" here;
# that would create a literal directory name and leave the real /usr/share/nginx/html unchanged.
COPY . /usr/share/nginx/html

# Expose the default http port
EXPOSE 80
