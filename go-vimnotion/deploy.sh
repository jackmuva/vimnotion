sudo docker build -t go-vimnotion:latest .
sudo docker tag go-vimnotion registry.digitalocean.com/vimnotion/go-vimnotion:latest
sudo docker push registry.digitalocean.com/vimnotion/go-vimnotion:latest
