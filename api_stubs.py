#!/usr/bin/env python2
# -*- coding: utf-8 -*-
from wsgiref.simple_server import make_server
from pyramid.config import Configurator
from pyramid.session import SignedCookieSessionFactory
from pyramid.response import Response
from pyramid.view import view_config
import logging
import bcrypt
import json
from collections import namedtuple
import functools

logging.basicConfig(level=logging.DEBUG)
log = logging.getLogger(__name__)
session_factory = SignedCookieSessionFactory('santeohkacr,')

def first(iter, default=None):
    for o in iter:
        return o
    return default

class User(namedtuple('User', 'id username password_hash')):

    def serialize(self):
        data_dict = self._asdict()
        del data_dict['password_hash']
        return json.dumps(data_dict)

AuthDetails = namedtuple('AuthDetails', 'username password')
user_db = [
    User(0, 'maxzhao', '$2a$12$7jK6V6sbD6TqCZQcxWA0ae59Tfx02cvxPb33HKR9Sd6b58cg8RccC'),  #test
]

def json_response(inner_fn):
    @functools.wraps(inner_fn)
    def wrapped(request):
        resp = inner_fn(request)
        resp.content_type = 'application/json'
        return resp
    return wrapped


@view_config(route_name='get_current_user', request_method='GET')
@json_response
def get_current_user(request):
    user_id = request.session.get('user_id')
    user_data = first(filter(lambda u: u.id==user_id, user_db))
    if user_data:
        return Response(user_data.serialize())
    else:
        request.session['user_id'] = None
        return Response('{"message": "Not logged in"}', status='403 Forbidden')

class AuthError(RuntimeError):
    pass

@view_config(route_name='authenticate_and_login', request_method='POST')
def authenticate_and_login(request):
    auth_details = AuthDetails(**request.json_body)
    request.session['user_id'] = None
    user_data = first(filter(lambda u: u.username == auth_details.username, user_db))

    try:
        if not user_data: raise AuthError("invalid username")
        if bcrypt.hashpw(str(auth_details.password), user_data.password_hash) != \
                user_data.password_hash:
            raise AuthError('invalid password')

        request.session['user_id'] = user_data.id
        return Response(status='204 No Content (success)')
    except AuthError:
        return Response('{"message": "username or password incorrect"}',
                status='403 Forbidden')

@view_config(route_name='logout', request_method='POST')
def logout(request):
    request.session['user_id'] = None
    return Response(status='204 No Content (success)')


def run_server():
    config = Configurator()
    config.set_session_factory(session_factory)
    config.add_route('get_current_user', '/coop_users/api/0.1/users/current_user')
    config.add_route('authenticate_and_login', '/coop_users/api/0.1/users/auth')
    config.add_route('logout', '/coop_users/api/0.1/users/logout')
    config.add_static_view('/coop_users', '.')
    config.scan()

    app = config.make_wsgi_app()
    local_binding = ('0.0.0.0', 8080)
    log.info('starting server at %s', local_binding)
    server = make_server(local_binding[0], local_binding[1], app)
    server.serve_forever()

if __name__ == '__main__':
    run_server()
