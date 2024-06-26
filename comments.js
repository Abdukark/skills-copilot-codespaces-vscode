// create web server
const http = require('http');
const fs = require('fs');
const url = require('url');
const qs = require('querystring');
const template = require('./lib/template.js');
const path = require('path');
const sanitizeHtml = require('sanitize-html');
const db = require('./lib/db');
const shortid = require('shortid');

// create server
const app = http.createServer(function(request, response) {
    const _url = request.url;
    const queryData = url.parse(_url, true).query;
    const pathname = url.parse(_url, true).pathname;

    if (pathname === '/') {
        if (queryData.id === undefined) {
            db.query(`SELECT * FROM topic`, function(err, topics) {
                const title = 'Welcome';
                const description = 'Hello, Node.js';
                const list = template.list(topics);
                const html = template.HTML(title, list, `<h2>${title}</h2>${description}`, `<a href="/create">create</a>`);
                response.writeHead(200);
                response.end(html);
            });
        } else {
            db.query(`SELECT * FROM topic`, function(err, topics) {
                if (err) {
                    throw err;
                }
                db.query(`SELECT * FROM topic LEFT JOIN author ON topic.author_id=author.id WHERE topic.id=?`, [queryData.id], function(err2, topic) {
                    if (err2) {
                        throw err2;
                    }
                    const title = topic[0].title;
                    const description = topic[0].description;
                    const list = template.list(topics);
                    const html = template.HTML(title, list, `<h2>${title}</h2>${description}<p>by ${topic[0].name}</p>`, `
                    <a href="/create">create</a>
                    <a href="/update?id=${queryData.id}">update</a>
                    <form action="delete_process" method="post">
                        <input type="hidden" name="id" value="${queryData.id}">
                        <input type="submit" value="delete">
                    </form>
                    `);
                    response.writeHead(200);
                    response.end(html);
                });
            });
        }
    } else if (pathname === '/create') {
        db.query(`SELECT * FROM topic`, function(err, topics) {
            db.query(`SELECT * FROM author`, function(err2, authors) {
                const title = 'Create';
                const list = template.list(topics);
                const html = template.HTML(title, list, `
                <form action="/create_process" method="post">
                    <p><input type="text" name="title" placeholder="title"></p>
                    <p>
                        <textarea name="description" placeholder="description"></textarea>
                    </p>
                    <p>
                        ${template.authorSelect(authors)}
                    </p>
                    <p>
                        <input type="submit">
                    </p>
                </form>
                `, `<a href="/create">create</a>`);
                response.writeHead(200);
                response.end(html);
            });
        });
    } else if (pathname === '/create_process') {
        let body = '';
        request.on('data', function(data) {
            body = body + data;
        });
        request.on('end', function() {
            const post = qs.parse(body);
            db.query(`INSERT INTO topic (id, title, description, created, author_id) VALUES(?, ?, ?, NOW(), ?)`, [shortid.generate(), post.title, post.description, post.author], function(err, result) {
                if (err) {
                    throw err;
                }
                response.writeHead(302, {Location: `/?id=${result.insertId}`});
                response.end();
            });
        });
    }
    else if (pathname === '/update') {
        db.query(`SELECT * FROM topic`, function(err, topics) {
            if (err) {
                throw err;
            }
            db.query(`SELECT * FROM topic WHERE id=?`, [queryData.id], function(err2, topic) {
                if (err2) {
                    throw err2;
                }
                db.query(`SELECT * FROM author`, function(err3, authors) {
                    const list = template.list(topics);
                    const html = template.HTML(topic[0].title, list,
                        `
                        <form action="/update_process" method="post">
                            <input type="hidden" name="id" value="${topic[0].id}">
                            <p><input type="text" name="title" placeholder="title" value="${topic[0].title}"></p>
                            <p>
                                <textarea name="description" placeholder="description">${topic[0].description}</textarea>
                            </p>
                            <p>
                                ${template.authorSelect(authors, topic[0].author_id)}
                            </p>
                            <p>
                                <input type="submit">
                            </p>
                        </form>
                        `,
                        `<a href="/create">create</a> <a href="/update?id=${topic[0].id}">update</a>`);
                    response.writeHead(200);
                    response.end(html);
                });
            });
        });
    }
    else if (pathname === '/update_process') {
        let body = '';
        request.on('data', function(data) {
            body = body + data;
        });
        request.on('end', function() {
            const post = qs.parse(body);
            db.query(`UPDATE topic SET title=?, description=?, author_id=? WHERE id=?`, [post.title, post.description, post.author, post.id], function(err, result) {
                if (err) {
                    throw err;
                }
                response.writeHead(302, {Location: `/?id=${post.id}`});
                response.end();
            });
        });
    }
    else if (pathname === '/delete_process') {
        let body = '';
        request.on('data', function(data) {
            body = body + data;
        });
        request.on('end', function() {
            const post = qs.parse(body);
            db.query(`DELETE FROM topic WHERE id=?`, [post.id], function(err, result) {
                if (err){
                    throw err;
                }
                response.writeHead(302, {Location: `/`});
                response.end();
            });
        });
    } else {
        response.writeHead(404);
        response.end('Not found');
    }
} );
