`backend/` -> Folder containing the backend API  
`frontend/` -> Folder containing the frontend implementation  
`scripts/` -> Folder containing scripts for deploying for dev/prod
`shell.nix` -> Environment to be used with `nix-shell`  

### Deploy to Production

```sh
# backend
scripts/backprod.sh
# frontend
scripts/frontprod.sh
```

### Deploy to Dev

```sh
# backend
scripts/backdev.sh
# frontend
scripts/frontdev.sh
```

### Notes

* https://flask.palletsprojects.com/en/1.1.x/deploying/uwsgi/
* https://uwsgi-docs.readthedocs.io/en/latest/Configuration.html
* https://serverfault.com/questions/412849/uwsgi-cannot-find-application-using-flask-and-virtualenv
