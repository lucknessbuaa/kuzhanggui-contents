host:=0.0.0.0
port:=15540
settings:=base/develop
	
activate_venv=source venv/bin/activate


debug:
	$(activate_venv) && ./manage.py runserver $(host):$(port) --settings=$(settings)

start-uwsgi:
	$(activate_venv) \
	&& uwsgi --socket 127.0.0.1:$(port) \
					--chdir $(shell pwd) \
					--wsgi-file base/wsgi.py \
					--static-map /contents/static=$(shell pwd)/static \
					--master \
					--process 4 \
					--daemonize $(shell pwd)/logs/uwsgi.log \
					--pidfile $(shell pwd)/uwsgi.pid  

stop-uwsgi:
	$(activate_venv) && uwsgi --stop uwsgi.pid

reload-uwsgi: 
	$(activate_venv) && uwsgi --reload uwsgi.pid

collectstatic:
	$(activate_venv) \
	&& ./manage.py collectstatic --noinput

database:=contents
password:=nameLR9969
db:
	-mysql -u root --password=$(password) -e \
				"drop database $(database)"
	mysql -u root --password=$(password) -e \
				"create database $(database)"
	$(activate_venv) && ./manage.py syncdb --noinput


deps:
	$(activate_venv) && \
	pip install -r requirements.txt && \
	pip install -r requirements-prod.txt && \
	npm install && \
	bower install

deps-osx:
	$(activate_venv) && \
	pip install -r requirements.txt && \
	npm install && \
	bower install


messages:
	$(activate_venv) && \
	./manage.py makemessages --ignore=venv --ignore=node_modules --ignore=bower_components --locale=zh_CN && \
	./manage.py compilemessages


.PHONY: debug \
		db \
		deps \
		messages \
		collectstatic \
		reload-uwsgi \
		start-uwsgi \
		stop-uwsgi
