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
import time
import binascii
import os

logging.basicConfig(level=logging.DEBUG)
log = logging.getLogger(__name__)
session_factory = SignedCookieSessionFactory('santeohkacr,')

def first(iter, default=None):
    for o in iter:
        return o
    return default

class User(namedtuple('User', 'id username fullname password_hash')):

    def serialize(self):
        data_dict = self._asdict()
        del data_dict['password_hash']
        return data_dict

class UserProfile(namedtuple('UserProfile', 'id,email,suite_number,lease_until')):

    def serialize(self):
        return self._asdict()

AuthDetails = namedtuple('AuthDetails', 'username password')
user_db = [
    User(0, 'maxzhao', 'Max Zhao', '$2a$12$7jK6V6sbD6TqCZQcxWA0ae59Tfx02cvxPb33HKR9Sd6b58cg8RccC'),  #test
]
user_profile_db = [
    UserProfile(0, 'test@email.com', 'S24', '2015 Winter'),
]

def csrf_protected(inner_fn):
    @functools.wraps(inner_fn)
    def wrapper(request):
        if not request.session.get('csrf_token') or \
                request.headers.get('X-XSRF-TOKEN') != \
                request.session.get('csrf_token'):
            return Response('{"message": "invalid csrf token", "cause": "invalid_csrf"}', status='403 Forbidden')
        return inner_fn(request)
    return wrapper

def json_response(inner_fn):
    @functools.wraps(inner_fn)
    def wrapped(request):
        resp = inner_fn(request)
        resp.content_type = 'application/json'
        return resp
    return wrapped

def authenticated(inner_fn):
    @functools.wraps(inner_fn)
    def wrapper(request):
        user_id = request.session.get('user_id')
        user_data = first(filter(lambda u: u.id==user_id, user_db))
        if not user_data:
            request.session['user_id'] = None
            return Response('{"message": "Not logged in"}', status='401 Forbidden')
        return inner_fn(request, user_data)
    return wrapper


@view_config(route_name='get_current_user', request_method='GET')
@json_response
@csrf_protected
@authenticated
def get_current_user(request, user_data):
    return Response(json.dumps(user_data.serialize()))

@view_config(route_name='user_profile', request_method='GET')
@json_response
@csrf_protected
@authenticated
def get_user_profile(request, user_data):
    requested_user_id = int(request.matchdict['user_id'])
    if requested_user_id != user_data.id:
        return Response('{"message": "you do not have the permission to view other users\' profiles"}', status='403 Forbidden')

    time.sleep(1.0)
    profile = first(filter(lambda p: p.id==requested_user_id, user_profile_db))
    if profile:
        return Response(json.dumps(profile.serialize()))
    else:
        return Response('{}')

class AuthError(RuntimeError):
    pass

@view_config(route_name='authenticate_and_login', request_method='POST')
@json_response
@csrf_protected
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
                status='401 Forbidden')

@view_config(route_name='regenerate_csrf_token', request_method='POST')
@json_response
def regenerate_csrf_token(request):
    new_token = binascii.b2a_hex(os.urandom(20))
    request.session['csrf_token'] = new_token
    response = Response(json.dumps({'csrf_token': new_token}))
    # Auto XSRF token insertion from https://docs.angularjs.org/api/ng/service/$http
    response.set_cookie('XSRF-TOKEN', new_token)
    return response



@view_config(route_name='logout', request_method='POST')
@json_response
@csrf_protected
def logout(request):
    request.session['user_id'] = None
    return Response(status='204 No Content (success)')


def run_server():
    config = Configurator()
    config.set_session_factory(session_factory)
    config.add_route('regenerate_csrf_token', '/coop_users/api/0.1/update_csrf')
    config.add_route('get_current_user', '/coop_users/api/0.1/users/current_user')
    config.add_route('authenticate_and_login', '/coop_users/api/0.1/users/auth')
    config.add_route('logout', '/coop_users/api/0.1/users/logout')
    config.add_route('user_profiles', '/coop_users/api/0.1/user_profile/')
    config.add_route('user_profile', '/coop_users/api/0.1/user_profile/{user_id}')
    config.add_static_view('/coop_users', '.')
    config.scan()

    app = config.make_wsgi_app()
    local_binding = ('0.0.0.0', 8080)
    log.info('starting server at %s', local_binding)
    server = make_server(local_binding[0], local_binding[1], app)
    server.serve_forever()

if __name__ == '__main__':
    run_server()
