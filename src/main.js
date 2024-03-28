const { createApp } = Vue;

createApp({
    data() {
        return {
            loading_visible: false,
            cards_visible:   false,
            reload_visible:  false,

            generated: [],
            cards:     [],

            scroll_load: false
        }
    },
    methods: {
        async callAPI(uri) {
            const response  = await fetch(uri);
            const data      = await response.json();

            return data;
        },
        async generateCard(num = 0, type = 'default') {
            const API_URI = '//pokeapi.co/api/v2/';

            try {
                switch(type) {
                    case 'detail': {
                        let data = await this.callAPI(`${API_URI}pokemon/${num}`);

                        let name = data.name[0].toUpperCase() + data.name.slice(1);

                        data = await this.callAPI(`${API_URI}pokemon-species/${name.toLowerCase()}`);

                        let content = '';

                        let lang = (new URL(window.location.href)).searchParams.get('lang'); // URIクエリ - 言語

                        if(!lang) lang = 'ja';

                        switch(lang) {
                            case 'ja': {
                                data.flavor_text_entries.forEach((item) => {
                                    if(item.language.name == 'ja') content = item.flavor_text;
                                });

                                break;
                            }

                            case 'en':
                            default: {
                                data.flavor_text_entries.forEach((item) => {
                                    if(item.language.name == 'en') content = item.flavor_text;
                                });

                                break;
                            }
                        }

                        this.cards.push({ class: 'detail', id: this.cards.length, num: num, content: content });

                        break;
                    }

                    default: {
                        let data = await this.callAPI(`${API_URI}pokemon/${num}`);

                        const typeColors = {
                            normal:   '#95afc0',
                            fire:     '#f0932b',
                            water:    '#0190ff',
                            electric: '#fed330',
                            grass:    '#00b894',
                            ice:      '#74b9ff',
                            fighting: '#ff4d4d',
                            poison:   '#6c5ce7',
                            ground:   '#efb549',
                            flying:   '#81ecec',
                            psychic:  '#a29bfe',
                            bug:      '#26de81',
                            rock:     '#2d3436',
                            ghost:    '#a55eea',
                            dragon:   '#ffc200',
                            dark:     '#30336b',
                            steel:    '#aeaeae',
                            fairy:    '#ff0069',
                        };

                        let img_src = data.sprites.other.dream_world.front_default;

                        let name = data.name[0].toUpperCase() + data.name.slice(1);

                        let hp      = data.stats[0].base_stat;
                        let attack  = data.stats[1].base_stat;
                        let defense = data.stats[2].base_stat;
                        let speed   = data.stats[5].base_stat;

                        let types = [];

                        data.types.forEach((item) => {
                            types.push({ name: item.type.name, color: typeColors[item.type.name] });
                        });

                        let typeColor = types[0].color;

                        let lang = (new URL(window.location.href)).searchParams.get('lang'); // URIクエリ - 言語

                        if(!lang) lang = 'ja';

                        switch(lang) {
                            case 'ja': {
                                data = await this.callAPI(`${API_URI}pokemon-species/${name.toLowerCase()}`);

                                data.names.forEach((item) => {
                                    if(item.language.name == 'ja-Hrkt') name = item.name;
                                });

                                break;
                            }

                            case 'en':
                            default: {
                                break;
                            }
                        }

                        this.generated.push(num);

                        this.cards.push({ class: 'card', id: this.cards.length, num: num, img_src: img_src, name: name, hp: hp, attack: attack, defense: defense, speed: speed, types: types, typeColor: typeColor });

                        break;
                    }
                }
            } catch(e) {
                console.error(e);
            }
        },
        async generateCards(num = 0) {
            const LIMIT = 500;                    // 最大読み込み数
            const RANGE = { min: 1, max: LIMIT }; // 読み込み範囲

            if((this.generated.length + num) >= LIMIT) return;

            if(this.loading_visible) return;

            this.loading_visible = true;

            for(let i = 0; i < num; i++) {
                let n = 0;

                do {
                    n = (Math.floor(Math.random() * (RANGE.max - RANGE.min + 1)) + RANGE.min);
                } while(this.generated.includes(n));

                await this.generateCard(n);
            }

            this.loading_visible = false;

            this.onScroll();
        },
        async init() {
            const LOAD_NUM = 10; // 読み込み数

            this.loading_visible = false;
            this.cards_visible   = false;
            this.reload_visible  = false;

            this.generated = [];
            this.cards     = [];

            this.scroll_load = false;

            let num = (new URL(window.location.href)).searchParams.get('detail'); // URIクエリ - 詳細

            num = Number(num);

            if(isNaN(num)) num = 0;

            if(num) {
                await this.generateCard(num);
                await this.generateCard(num, 'detail');
            } else {
                await this.generateCards(LOAD_NUM);

                this.reload_visible = true;
                this.scroll_load    = true;
            }

            this.cards_visible = true;
        },
        openDetail(num = 0) {
            let lang = (new URL(window.location.href)).searchParams.get('lang'); // URIクエリ - 言語

            if(!lang) lang = 'ja';

            window.open(`./?detail=${num}&lang=${lang}`);
        },
        reload() {
            this.init();
        },
        onScroll() {
            const LOAD_NUM = 10; // 読み込み数

            if((window.innerHeight + window.scrollY) < document.querySelector('#app').scrollHeight) return;

            if(!this.scroll_load) return;

            this.generateCards(LOAD_NUM);
        }
    },
    mounted() {
        window.addEventListener('scroll', this.onScroll);

        this.init();
    },
    beforeUnmount() {
        window.removeEventListener('scroll', this.onScroll);
    }
}).mount('#app');