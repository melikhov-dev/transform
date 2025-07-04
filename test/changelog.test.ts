import type {Logger} from '../src/transform/log';
import type {ChangelogItem} from '../src/transform/plugins/changelog/types';

import path from 'path';
import fs from 'fs';

import transform from '../src/transform';
import changelogPlugin from '../src/transform/plugins/changelog';
import changelogCollect from '../src/transform/plugins/changelog/collect';
import imsize from '../src/transform/plugins/imsize';

describe('Changelog', () => {
    function getItem(date: string | undefined, index: number | undefined) {
        return {
            date,
            index,
            storyId: '123321',
            title: 'Change log title',
            image: {
                alt: 'My image',
                ratio: 0.5625,
                src: '../src/asd.png',
            },
            description: '<p>Change log payload</p>\n',
        };
    }

    test('Should cut changelog', async () => {
        expect.assertions(2);

        const data = await fs.promises.readFile(
            path.join(__dirname, 'data/changelog/changelog.md'),
            'utf8',
        );

        const {
            result: {html, changelogs: logs},
        } = transform(data, {
            plugins: [changelogPlugin, imsize],
        });

        expect(html).toBe(`<h1>Some changelog</h1>\n<p>After changelog</p>\n`);

        expect(logs).toBe(undefined);
    });

    test('Should cut changelog with date and write it in env', async () => {
        expect.assertions(2);

        const data = await fs.promises.readFile(
            path.join(__dirname, 'data/changelog/changelog_date.md'),
            'utf8',
        );

        const {
            result: {html, changelogs: logs},
        } = transform(data, {
            plugins: [changelogPlugin, imsize],
            extractChangelogs: true,
        });

        expect(html).toBe(`<h1>Some changelog</h1>\n<p>After changelog</p>\n`);

        expect(logs).toEqual(new Array(3).fill(getItem('2023-05-10', undefined)));
    });

    test('Should cut changelog with index and write it in env', async () => {
        expect.assertions(2);

        const data = await fs.promises.readFile(
            path.join(__dirname, 'data/changelog/changelog_index.md'),
            'utf8',
        );

        const {
            result: {html, changelogs: logs},
        } = transform(data, {
            plugins: [changelogPlugin, imsize],
            extractChangelogs: true,
        });

        expect(html).toBe(`<h1>Some changelog</h1>\n<p>After changelog</p>\n`);

        expect(logs).toEqual(
            new Array(3).fill(getItem(undefined, 0)).map((item, index) => {
                return {...item, index: 3 - index};
            }),
        );
    });

    test('Should cut changelog and write it in env', async () => {
        expect.assertions(2);

        const data = await fs.promises.readFile(
            path.join(__dirname, 'data/changelog/changelog.md'),
            'utf8',
        );

        const {
            result: {html, changelogs: logs},
        } = transform(data, {
            plugins: [changelogPlugin, imsize],
            extractChangelogs: true,
        });

        expect(html).toBe(`<h1>Some changelog</h1>\n<p>After changelog</p>\n`);

        expect(logs).toEqual(new Array(3).fill(getItem(undefined, undefined)));
    });

    test('Should cut changelog and write it in variable', async () => {
        expect.assertions(2);

        const data = await fs.promises.readFile(
            path.join(__dirname, 'data/changelog/changelog.md'),
            'utf8',
        );

        const changelogs: ChangelogItem[] = [];
        const html = changelogCollect(data, {
            path: '',
            changelogs,
            log: console as unknown as Logger,
            extractChangelogs: true,
        });

        expect(html).toBe(`# Some changelog





After changelog
`);

        expect(changelogs.length).toBe(3);
    });

    test('Should cut changelog on the edge and write it in variable', async () => {
        expect.assertions(2);

        const data = (
            await fs.promises.readFile(
                path.join(__dirname, 'data/changelog/changelog_edge.md'),
                'utf8',
            )
        ).trim();

        const changelogs: ChangelogItem[] = [];
        const html = changelogCollect(data, {
            path: '',
            changelogs,
            log: console as unknown as Logger,
            extractChangelogs: true,
        });

        expect(html).toBe('');

        expect(changelogs.length).toBe(1);
    });
});
