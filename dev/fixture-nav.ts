import { fixtures } from './fixtures.js';

const nav = document.querySelector<HTMLElement>('.js-dev-fixtures');
if (nav) {
    const current =
        new URLSearchParams(location.search).get('fixture') ?? 'default';
    Object.keys(fixtures).forEach((name) => {
        const a = document.createElement('a');
        a.href = `?fixture=${name}`;
        a.textContent = name;
        if (name === current) {
            a.setAttribute('data-current', 'true');
        }
        nav.appendChild(a);
    });
}
