# Curriculum map and progression

This document fixes the curriculum's principles, the order in which its content is taught, and how a learner moves through it. It is the reference for authoring order, pacing, and progression gates. Structured node data stays in [curriculum.json](../curriculum.json); the teaching rules that make each lesson work are in [content-standard.md](content-standard.md).

Current implementation and exact counts are in the [generated inventory](content-inventory.md). The [25 October audit](curriculum-audit.md) prioritizes pacing, coverage and content additions. The full-course arcs below are a planning model; the runnable path is documented under [The general sequence](#the-general-sequence).

## Curriculum principles

1. **Venues are the cornerstone, not a boundary.** Practical places and conversations organize everything the learner sees: a restaurant table, a convenience-store counter, a ticket gate, a clinic reception, a neighbor at the door. The venue list is open. A new venue joins through a venue brief and reuses existing nodes and skills; it does not require a curriculum rewrite.
2. **Testing is the main learning event.** Each session opens with retrieval, each lesson ends with retrieval, and every new language item is scheduled to come back. Retrieving something from memory strengthens it far more than re-reading it ([Roediger & Karpicke, 2006](https://pubmed.ncbi.nlm.nih.gov/16507066/)). Explanation supports testing; it does not replace it.
3. **Repetition must change something.** An item comes back with a different direction, venue, partner, format, support level, delay, or combination with newer language. Re-asking the same question under a new topic label teaches little, and drill-style repetition of basics is a design failure here.
4. **Read, retain, then answer.** Passages are read with support and then hidden before the questions. Comprehension is tested from memory, again after a delay, and finally on an unseen text of the same kind.
5. **Kanji grows through words the learner meets.** Hiragana and katakana are assumed. Kanji are introduced slowly as written words from the current venue, taught by what they mean and how they are read in a sentence, never by their parts. Text is written in kana, with a met word's kanji shown small above it, until the learner knows the word; from then on that word appears in kanji everywhere, with its reading a tap away ([Kanji growth](#kanji-growth)).
6. **Spacing and delayed transfer decide progress.** Immediate success is "practiced". Progress claims need retention after a delay and use in a changed situation.
7. **Pacing protects retention.** New material is added only when delayed retrieval holds. When it slips, the curriculum consolidates before expanding. Every arc ends with a consolidation week.
8. **Chunks first, rules next, expansion last.** A useful phrase can be learned as a chunk before its grammar is explained. The rule is derived later, in a named bridge, before vocabulary rounds depend on it.
9. **Evidence stays honest.** Seen, practiced, retrieved, retained, transferred, and independently demonstrated are separate states. No level, node, or arc is equated with JLPT, CEFR, or fluency.

## The restaurant-first rollout, reconciled

**Opening route, confirmed 22 October 2026:** start with **Basic sentences**, which unlocks **Restaurants**. Meeting people and Shopping no longer open from Basic sentences on their own. In the current draft, they branch after the first restaurant lesson, *A table for two* (r01); completing all restaurant depth is not required. Dating and relationships is implemented as four optional practices under pl02, with two optional books; it has no lesson or garden stone.

The earlier plan limited the first release to foundations plus the restaurant core and kept every other node as an outline. That made the restaurant a gate in practice, and it made delayed transfer untestable, because transfer needs a second venue to transfer into.

The new position:

- **The restaurant stays the reference node.** It is the most developed node and the first to get fully authored lessons. Other nodes copy its pattern of depth stages and + rounds ([restaurant-node.md](restaurant-node.md)).
- **It is not a boundary.** The first release includes the core stages of all three level-1 venues: At the table, Everyday shopping, and Meeting people. Their shared moves (requests, prices, quantities, repair) are taught once and tested across venues from the first weeks.
- **Restaurant depth is spread through the sequence.** Its four layers are taught in Arcs 1, 4, 6, and 8, each when the grammar it needs is ready, instead of being front-loaded.
- **Other venues are not second-class.** Production balance rules in [roadmap.md](roadmap.md) stop any single node from absorbing the authoring budget.

## The hierarchy

**Personal level → topic node → depth stage → lesson → practice task.** A vocabulary expansion attaches to a node and reuses learned structures. A shared skill belongs to several nodes, with one canonical explanation and several contextual applications.

A **venue** is the concrete setting where a node's moves happen: a ramen ticket machine, a supermarket checkout, a ward-office window. Nodes own communicative functions; venues supply situations. One venue can serve several nodes (a station appears in Getting around and in When plans go wrong), and one node can use many venues.

Map position is a useful entry point, not the maximum difficulty inside a topic. Deep restaurant conversation can coexist with early restaurant ordering.

## The six personal levels

| Level | Name | Performance target | Examples of language growth |
|---|---|---|---|
| 0 | Find your footing | Build a simple request, identify information, and repair a missed message | Context and omission; basic predicate patterns; questions; prices; repair chunks |
| 1 | First encounters | Complete a familiar brief exchange with a cooperative partner | Demonstratives; existence; item requests; counters; simple preferences |
| 2 | Everyday rhythm | Link actions, time, choices, and reasons | Verb families; nonpast/past; negatives; particles by function; sequence; time and frequency |
| 3 | Connected conversations | Sustain a familiar exchange and ask relevant follow-ups | Plain-form bridges; reasons; experience; comparison; invitations; connected turns |
| 4 | Independent situations | Handle a complication and negotiate a next step | Conditions; possibility; reported information; qualifications; polite disagreement |
| 5 | Depth and nuance | Follow connected discourse, explain viewpoints, and adapt to relationships | Reference and cohesion; inference; stance; narrative; register; longer reading |

These are curriculum design levels, not external qualifications. Some useful chunks appear before their full grammar is derived. Mark them as chunks and revisit the structure later.

## The field

| Row | Nodes | Why they belong here |
|---|---|---|
| 1 | Making meaning | Shared tools for every situation |
| 2 | At the table · Meeting people · Everyday shopping | Short concrete exchanges with many reusable moves |
| 3 | Getting around · Life at home · Time & plans | Location, routines, sequencing, and coordinated choices |
| 4 | Dating & relationships | The same invitations and confirmations with explicit intent, and clear answers on both sides |
| 5 | Friends & small talk · Work & study · Appointments & services | Longer exchanges with reasons and follow-up |
| 6 | Health conversations · Housing & neighbors · When plans go wrong | Greater precision, clarification, and independent problem solving |
| 7 | Ideas & opinions · Reading the world · Stories & experiences | Connected discourse, interpretation, and viewpoint |
| 8 | Belonging locally · Food beyond the table | Integrative contexts drawing on multiple earlier skills |

Every node's objectives, stage titles, lesson titles, expansions, prerequisites and capstone are in [curriculum.json](../curriculum.json). The [generated inventory](content-inventory.md#content-totals) gives the current catalogue total, playable lessons, converted practices and unbuilt titles. Each lesson has a general practice and at least one general book; home and unlock requirements are listed separately there.

## The open venue catalogue

Venues are grouped into families. "Setting" means the venue is taught inside an existing node's lessons or + rounds. "Candidate node" means it may deserve its own node later (see below). The catalogue is meant to grow; add a row through the venue brief in [lesson-template.md](lesson-template.md).

| Family | Example venues | Host node(s) | First reachable | Status |
|---|---|---|---|---|
| Eating out | Table-service restaurant, ramen ticket machine, café counter, family restaurant tablet ordering, izakaya, food court, takeaway | At the table; Food beyond the table | Arc 1 | Covered |
| Everyday shops | Convenience store, supermarket, drugstore, 100-yen shop, bakery, clothing, electronics | Everyday shopping | Arc 1 | Covered; konbini is the first shopping venue |
| People | Neighbor in the corridor, language exchange, coworker, a friend's friend at a party | Meeting people; Friends & small talk | Arc 1 | Covered |
| Messages | Chat-app messages, short emails, invitation cards, schedule changes | Time & plans; Work & study; Reading the world | Arc 2 | Covered |
| Getting around | Train station, ticket machine and IC card, bus, taxi, bicycle parking, airport | Getting around; When plans go wrong | Arc 3 | Covered |
| Home | Your room, household chores, appliances, garbage sorting and collection days | Life at home; Housing & neighbors | Arc 2 | Covered |
| Appointments & personal services | Hair salon, phone shop, parcel redelivery, dry cleaner, repair counter, phone calls | Appointments & services | Arc 4 | Covered |
| Work & study | Office task, part-time job shift, class or language school, meeting | Work & study | Arc 5 | Covered |
| Health | Clinic reception, pharmacy, dentist, describing symptoms to a friend | Health conversations | Arc 7 | Covered; needs qualified review |
| Housing | Real-estate listing, building management, maintenance visit, neighbor noise | Housing & neighbors | Arc 7 | Covered |
| Mishaps | Lost property at a station or 交番 (こうばん, police box), wrong item delivered, missed train | When plans go wrong | Arc 7 | Covered |
| Public offices & money | Ward office (residence registration, forms), post office, bank and ATM | Appointments & services (setting) | Arc 6 | Candidate node: Offices & paperwork |
| Staying somewhere | Hotel check-in, ryokan, guesthouse rules, asking for an item at the front desk | At the table / Appointments & services (setting) | Arc 4 | Candidate node: Staying somewhere |
| Safety | Earthquake and typhoon information, evacuation notices, emergency numbers, disaster kit | Housing & neighbors; Belonging locally (setting) | Arc 7 | Candidate node: Safety & emergencies; needs qualified review |
| Leisure & culture | Onsen and sentō, gym membership, museum, cinema, karaoke, festivals, shrines and temples | Time & plans + rounds; Belonging locally | Arc 3 | Candidate node: Leisure & culture |
| Community | Neighborhood association, volunteer day, school or community events | Belonging locally | Arc 10 | Covered |

### Candidate nodes

These are proposals only and are not yet in `curriculum.json`. Each needs a node brief, prerequisites, three depth stages, and an educator's sign-off before it is added. The map allows one to three nodes per row, so adding a node means placing it in a row with space (rows 1, 4 and 8) or adding a row; the validator enforces this.

| Candidate | Entry level | Likely prerequisites | Why it may need its own node |
|---|---|---|---|
| Staying somewhere | 2 | foundations, shopping, transport | Check-in, facility rules, and requests at a desk recur for travelers and new residents |
| Offices & paperwork | 3 | services, home | Forms, identification, and formal procedures are high-stakes and use distinctive written Japanese |
| Safety & emergencies | 3 | home, transport | Disaster and emergency language is life-relevant and fits poorly as a side lesson; Irodori also treats it as a core everyday topic |
| Leisure & culture | 2 | plans, introductions | Bathhouse, gym, and event rules are frequent practical encounters |

Until a candidate is promoted, its venues are taught as settings inside the host nodes listed above.

## The sequenced curriculum

### Pacing model

The default rhythm is five 25-minute sessions a week: two new-learning sessions, one read-retain-test passage, one conversation scenario answered by choosing replies, and one delayed transfer/review session. That gives about 2–3 new lessons a week. Each arc ends with a **consolidation week** with no new lessons.

The arc allocation below is the earlier 212-title planning model. The catalogue has since grown and some titles became optional practices, so its teaching-week totals are not a current course-duration estimate. Reallocate new bridge and venue content before using these numbers for production planning.

**Full-product pace-control target (not implemented):** if delayed retrieval for the current arc drops below the threshold in [content-standard.md](content-standard.md), new lessons pause and review sessions take their slots until it recovers.

### Arc overview

| Arc | Level | Teaching weeks | Content (lessons) | Grammar bridge | Kanji words (cumulative) | Passage recall target |
|---|---|---|---|---|---|---|
| 0 | 0 | 4 | Making meaning, all 3 stages (9) | Predicates, questions, requests, numbers, repair | ~15 | Glance texts (prices, signs), open book, then hidden after one look |
| 1 | 1 | 9 | At the table core (12); Everyday shopping, all 3 stages (9); Meeting people stage 1 (3) | Existence, place words, counters, preferences, ます verbs as chunks | ~65 | Menu + exchange, shop flyer, intro card; closed-book recognition; 1-day delayed |
| 2 | 1→2 | 5 | Bridge A (2); Meeting people stages 2–3 (6); Time & plans stage 1 (3); Life at home stage 1 (3); +1 rounds for At the table and shopping | **A: verb family** (ます/ません/ました/ませんでした); **particles by function**; **B: adjective patterns** | ~115 | Schedule message, invitation; closed-book cued recall; 3-day delayed |
| 3 | 2 | 8 | Getting around, all 3 stages (9); Time & plans stages 2–3 (6); Life at home stage 2 (3); Dating & relationships stage 1 (3, optional) | **C: て-form and verb groups**; ～ています; ～たい; reasons with から | ~175 | Station notice, route explanation, a diary day; sequence reconstruction; 7-day delayed + transfer |
| 4 | 2→3 | 7 | Life at home stage 3 (3); At the table "Changes & surprises" (12); Appointments & services stage 1 (3) | Permission and prohibition; restriction (しか～ない); softer reasons (ので); before/after with nouns | ~230 | Reservation message with conditions, household notice; condition tracking |
| 5 | 3 | 9 | Friends & small talk, all 3 stages (9); Work & study, all 3 stages (9); Dating & relationships stages 2–3 (6, optional) | **D: plain forms** and casual register; ～と思います; ～んです; experience (～たことがあります); noun-modifying clauses; obligation | ~295 | Work email, a friend's blog post; idea-unit recall |
| 6 | 3 | 7 | Appointments & services stages 2–3 (6); At the table "Conversation around food" (12) | **E: comparison** (より/ほうが/一番); ～すぎる; ～やすい/にくい; appearance ～そう; giving and receiving | ~350 | Restaurant review, service confirmation; delayed transfer to a new text |
| 7 | 4 | 10 | Health conversations (9); Housing & neighbors (9); When plans go wrong (9) | **F: conditionals** (たら/ば/と/なら by function); potential; possibility; hearsay; ～てしまう; request ladder (～てもらえませんか/～ていただけませんか); passive (recognition); volitional ～(よ)うと思います | ~440 | Fictional clinic instructions, building notice with exceptions, incident account; "what cannot be concluded" |
| 8 | 4→5 | 8 | At the table "Independent dining" (12); Ideas & opinions (9) | Honorific/humble recognition system; stance and certainty (はずです, わけではない); connectives (しかし, それに, つまり, 一方) | ~520 | Detailed review, opinion column; fact vs. opinion recall |
| 9 | 5 | 7 | Reading the world (9); Stories & experiences (9) | Narrative: background ～ていた, ～ようになった, ～ことになった; quoting and reported speech; passive and causative production; cohesion across sentences | ~620 | Short article, personal essay, short story |
| 10 | 5 | 7 | Belonging locally (9); Food beyond the table (9) | Purpose (ように, ために); ～について/～によって; preparation ～ておく; recipe sequence; formal community register | ~720 | Community newsletter, recipe with a food story; synthesis across two texts |

Earlier allocation: 212 titles (9 + 24 + 14 + 21 + 18 + 24 + 18 + 27 + 21 + 18 + 18), 81 teaching weeks and 11 consolidation weeks. These are historical planning totals, not the current playable course or catalogue count. Dating titles belong to optional practices. The allocation needs reconciliation with the current bridges and venue additions; runtime prerequisites come from `path.requires`, not this arc table.

Kanji counts are **words read in kanji** with readings available on tap, not a count of characters. They are tunable defaults. See [Kanji growth](#kanji-growth) below.

### Arc details

Arc gates, stage exits, and capstones use the same tap and drag formats as lessons. Where a gate or capstone below says tell, explain, write, or hold an exchange, the learner does it in written Japanese by choosing each reply, ordering tiles, and completing the exchange from a word bank; nothing is spoken or typed, and the result is not evidence of speaking or free writing.

**Arc 0 — Find your footing (Making meaning).**
Can-do: make a request, ask a price, check a detail, and recover from a missed message with a cooperative partner.
Language: N です／ですか; これ・それ・あれ・どれ; N を ください／お願いします; numbers and 円 (えん); いくらですか; repair chunks such as もう一度 お願いします and "～って 何ですか" (chunk); は marking what is being talked about; recoverable omission.
Spelling and sound work: long vowels, small っ, mora timing (kana is known, but noticing these is not guaranteed), taught through written pairs the learner chooses between, such as おばさん／おばあさん.
Kanji: numbers 一 to 十, 百, 千, 円, 人, 水, 何.
Arc gate: an unseen buy-one-thing exchange with one misunderstood detail, delayed by at least 3 days.

**Arc 1 — First venues (restaurant, konbini and shops, first introductions).**
Can-do: complete a meal out and a shop visit, introduce yourself briefly, and understand the common service questions.
Language: あります／います; ここ・そこ・あそこ・どこ; counters つ, 個, 枚, 本, 人, 杯 (as chunks); N と N; N が いいです; N も; い/な adjectives in polite sentences and before nouns; ～で お願いします for payment; ます verbs as chunks (食べます, 飲みます, 行きます, します); ～から 来ました and ～に 住んでいます as chunks.
Recognition only: いらっしゃいませ, 何名様ですか, 店内でお召し上がりですか, 袋はご利用ですか, ポイントカードはお持ちですか, 温めますか.
Kanji: 店, 入口, 出口, 男, 女, 大・中・小, 税込, 現金, 定食, お茶, 肉, 魚, 安い, 高い, 会計, 営業中, 名前, 日本.
Interleaving: restaurant and shop lessons alternate so the request, price, and counter skills are tested in both venues from week 2.
Arc gate: unfamiliar restaurant **and** konbini exchanges after a delay; a delayed transfer into a venue not taught in the arc (bakery or drugstore counter).

**Arc 2 — Everyday rhythm begins.**
Can-do: say what you do and did, arrange a simple time, describe a room, and keep a self-introduction going with a follow-up.
Bridge A, verb family: ます, ません, ました, ませんでした; ～ませんか, ～ましょう, ～ましょうか. Two draft units teach it by contrast, ba01 and ba02 ([Bridge A](#bridge-a-the-verb-family)). They sit in the general sequence just before r08, ahead of the rest of this arc, because the food story and the reviews after it already need the endings.
Particles by function: に (time, destination), で (place of action, means), を, へ, と. Each is introduced from contrasting sentences, not as a translation table.
Bridge B, adjective patterns: polite present/past/negative of い and な adjectives. Its two units sit right after i06 ([Home life](#home-life)): bb01 (present affirmative and negative), then bb02 (past affirmative and negative).
Also: days of the week, dates, times; frequency words (よく, ときどき, あまり～ない).
+1 rounds: Everyday dishes (already sampled) and Grocery shelves, both recombining Arc 1 frames.
Kanji: 月, 火, 水, 木, 金, 土, 日, 曜日, 今日, 明日, 昨日, 毎日, 午前, 午後, 時, 分, 半, 週, 年, 家, 仕事, 学生, 友達, 行く, 来る, 見る, 食べる, 飲む.
Arc gate: a delayed scheduling exchange from a message, plus describing yesterday from a closed-book diary passage.

**Arc 3 — Moving through the day.**
Can-do: follow and give directions, choose a train from a timetable, handle a delay, plan an outing, and describe a routine.
Bridge C: て-form derivation through the verb groups; ～てください; ～て sequence; ～てから; ～ています (ongoing action and resulting state: 住んでいます, 混んでいます); ～たい; reasons with ～から.
Venue language: ～に 乗ります／降ります／乗り換えます; ～まで どのくらい かかりますか; まっすぐ 行って, 右に 曲がって.
Kanji: 駅, 電車, 線, 番線, 乗り換え, 北口・南口・東口・西口, 右, 左, 上, 下, 前, 後, 時刻表, 各駅停車, 快速, 急行, 切符, 改札, 遅れ, 部屋, 朝, 夜.
Arc gate: an unseen station-notice passage recalled closed-book, then acting on it in a route-change scenario a week later.

**Arc 4 — Choices with constraints.**
Can-do: ask about ingredients, make a request with a constraint, accept an alternative, make and change a reservation, book a simple service, and share household tasks.
Language: ～は 入っていますか; ～ないでください (polite request not to); ～ても いいですか; ～ては いけません (recognition); ～しか ～ない; ～ので; N の 前に／後で; ～抜きで and ～少なめで (chunks).
Safety note: preferences, intolerances, and allergies are taught as distinct situations; safety-critical content needs qualified review ([restaurant-node.md](restaurant-node.md)).
Kanji: 予約, 席, 禁煙, 卵, 小麦, 辛い, 品切れ, 待つ, 受付, 住所, 電話, 番号, 確認, 料金, 当日.
Arc gate: a delayed restaurant visit with an unannounced complication, plus a reservation message whose conditions must be recalled closed-book.

**Arc 5 — Connected conversations (friends and work).**
Can-do: hold a short casual chat with follow-ups, switch appropriately between a friend and a colleague, ask for and confirm instructions, and report progress.
Bridge D, plain forms: dictionary, ない, た, and plain adjective/noun forms; casual speech as a register choice, not as "dropping politeness".
Language: ～と 思います; ～んです (explaining a situation); ～たことが あります; noun-modifying clauses (昨日 見た 映画); ～なければ なりません／～なくても いいです; ～たり ～たり; ～ながら; backchannels (そうなんですか, へえ, なるほど).
Kanji: 会社, 会議, 資料, 終わる, 始まる, 休み, 手伝う, 書く, 読む, 話す, 聞く, 思う, 好き, 趣味, 先週, 来週.
Arc gate: an unfamiliar casual exchange, answered by choosing each reply and completing lines from a word bank, that includes a follow-up the learner has not seen before; plus a work email recalled closed-book and acted on after a delay.

**Arc 6 — Explaining and comparing.**
Can-do: explain what you want from a service and clarify the cost, compare dishes and options, invite and decline gently, and talk about a first experience.
Bridge E, comparison: A と B と どちらが; A より B の ほうが; 一番; ～すぎる; ～やすい／～にくい; ～そう (appearance); あげる／もらう／くれる.
Venue language: ～は どうですか; ちょっと… (trailing decline); ～込み (included).
Venue settings: post office and bank counters are first taught here inside Appointments & services.
Kanji: 変更, 込み, 味, 甘い, 季節, 地元, 初めて, 料理, 郵便局, 銀行, 送る.
Arc gate: an unseen review passage recalled closed-book, then a delayed restaurant conversation about a dish with a friend.

**Arc 7 — Independent situations (health, housing, mishaps).**
Can-do: describe a symptom and its timing, check an instruction, explain a household problem, reconstruct what happened, and negotiate a next step.
Bridge F, conditionals by function: ～たら, ～ば, ～と, ～なら.
Also: potential form; ～かもしれません; ～みたいです／～ようです; hearsay ～そうです; ～てしまいました; ～ても; ～てもらえませんか／～ていただけませんか; passive for recognition (盗まれた); ～(よ)うと 思います; notice language (～こと, ～禁止, ～ないでください).
Venue settings: lost property at a 交番, garbage-collection rules, and earthquake information (until the Safety candidate node exists).
Kanji: 病院, 薬, 熱, 頭, 痛い, 診察, 保険証, 家賃, 契約, ゴミ, 燃える, 燃えない, 収集日, 故障, 修理, 届く, 忘れ物, 地震, 避難.
Arc gate: three delayed transfer tasks, one per node, each in a venue not used during teaching, plus a notice passage with exceptions recalled after one week.

**Arc 8 — Independent dining and opinions.**
Can-do: interpret a long review, recognize formal service language, resolve a billing question, and give a qualified opinion while acknowledging another view.
Language: honorific and humble forms for recognition (いらっしゃる, 召し上がる, ご～ください, ～でございます, かしこまりました), with production limited to humble requests; ～はずです; ～わけでは ない; ～だけで なく; connectives しかし, それに, つまり, 一方.
Kanji: 評価, 感想, 意見, 理由, 賛成, 反対, 個室, 雰囲気, 別々.
Arc gate: the restaurant capstone (an unfamiliar 8–12 turn exchange with two changes, completed by choosing each reply) and an opinion column summarized from memory after a delay.

**Arc 9 — Reading the world and telling stories.**
Can-do: follow and summarize an article, resolve references across paragraphs, tell an experience with background and consequence, and answer an interruption.
Language: background ～ていた; ～ようになった; ～ことになった; quoting (～と 言っていました, ～って); ～らしい; productive passive and causative (～させてください); cohesion with こそあど reference across sentences; それで, すると, ところが; ～ということです.
Kanji: 記事, 情報, 結果, 経験, 気持ち, 旅行, 思い出, 理解, 説明.
Arc gate: an unseen article recalled closed-book, with a "what cannot we conclude?" item, plus an unseen personal story rebuilt by putting its events in order and completing it from a word bank, then two follow-up questions answered by choosing replies.

**Arc 10 — Belonging and food beyond the table.**
Can-do: read a community announcement and take part in a shared plan, follow and explain a recipe, adapt it, and tell a food memory.
Language: ～ように; ～ために; ～に ついて; ～に よって; ～ておく; recipe sequences (～を ～に 切る, ～まで 煮る); formal community register for recognition.
Kanji: 地域, 参加, 行事, 祭り, 当番, 材料, 切る, 焼く, 煮る, 大さじ, 小さじ.
Arc gate: two related texts (a newsletter and a message) synthesized from memory, plus explaining a dish with a substitution after a delay.

### Consolidation weeks

Each arc closes with one week without new lessons. It contains:

1. **Delayed retrieval** of the arc's items, at least 7 days after each item's last practice.
2. **Unseen passage recall** in the arc's text types, using the full read-retain-test protocol.
3. **Delayed transfer** in a venue that was not used in the arc's teaching.
4. **Capstones** for nodes whose final stage was taught in the arc.
5. **Gap routing:** each failed item or can-do points to a specific review or bridge lesson. A gap never resets a completed node.

Between consolidation weeks, **cumulative checkpoints** on the Learn path bring part of this forward: at authored boundaries (currently blocks of five, with six in block 2), a closed-book check on those lessons and a smaller share of earlier ones, each item a taught frame in a venue it was not taught in, with every miss routed to the words-table row or point that teaches it and back into the review schedule ([data-contract.md](data-contract.md#checkpoints)). They are retrieval in changed contexts, spaced by lessons rather than by days: five lessons can be finished in one sitting, so a checkpoint does not show 7-day retention and does not replace the delayed retrieval above. The cadence and sample sizes are product defaults to evaluate with learners.

### Node map: all 19 topics

| Node | Arc(s) | Headline practical outcome | Prerequisites | Language growth | Kanji words in context | Passage types | Assessment |
|---|---|---|---|---|---|---|---|
| Making meaning | 0 | Request, check, and repair with a cooperative partner | — | Predicates, questions, requests, numbers, omission | Numbers, 円, 何, 人 | Price tags, short signs | Capstone: identify, request, misunderstand, check; transfer: every node |
| At the table | 1, 4, 6, 8 | Complete a meal out; handle changes; converse about food; dine independently | foundations | Counters → constraints → comparison → keigo recognition | 定食, 会計, 予約, 品切れ, 評価 | Menu → changed-order account → reservation message → long review | Stage exits per [restaurant-node.md](restaurant-node.md); delayed capstone with new details |
| Meeting people | 1, 2 | Introduce yourself and keep it going with a follow-up | foundations | Topic and omission, ～から 来ました, past tense for background | 名前, 日本, 仕事, 学生 | Self-intro card, short profile | Neighbor introduction with an unexpected question |
| Everyday shopping | 1 | Find, choose, and pay; answer checkout questions | foundations | Place words, counters, comparison seeds | 税込, 現金, 大・中・小, 安い, 高い | Shelf labels, flyers, receipts | Find, ask, choose, answer two checkout questions; delayed transfer to a new shop |
| Life at home | 2, 3, 4 | Describe your space and routine; share tasks | foundations, introductions | Existence, frequency, ～ています, requests | 部屋, 朝, 夜, ゴミ | Household instruction, building notice | Describe home and routine, negotiate a task |
| Time & plans | 2, 3 | Arrange, change, and confirm a plan | introductions, foundations | Dates, ～ませんか, て-form sequence, reasons | 曜日, 時, 分, 午前, 午後 | Chat messages, schedules | Arrange an outing, handle a conflict, confirm in a message |
| Getting around | 3 | Follow a route, use a timetable, recover from a change | foundations, shopping | Movement verbs, て-form directions, ～ています states | 駅, 線, 改札, 北口, 遅れ | Station signs, timetables, delay notices | Explain a route, choose a connection, handle a change |
| Dating & relationships | 3, 5 (optional practices) | Ask someone out clearly, settle the plan, and give or respect a clear answer | introductions, plans | Bounded chunks: デートしませんか, ふたりで/みんなで, ［N］にしましょう, また会いたいです, 付き合ってください (recognized), boundaries in ません; feelings and casual register after Bridge D | 趣味, 大好き, 今度, 楽しみ, 返事, 付き合う, お酒, 帰る | Message threads: a date that moves, a clear no | Arrange a date from a shared interest, handle a change by message, answer a relationship request; repeat after a delay with a new partner and constraint |
| Friends & small talk | 5 | Sustain a casual exchange with relevant follow-ups | introductions, plans | Plain forms, casual register, backchannels | 好き, 趣味, 先週 | Friend's post, chat thread | An unfamiliar casual exchange answered by choosing each reply, plus a connected personal account completed from a word bank |
| Work & study | 5 | Clarify a task, report progress, write a short request | home, plans | Obligation, noun-modifying clauses, ～んです | 会社, 会議, 資料, 終わる | Work email, instruction note | Clarify a task, describe progress, negotiate a next step |
| Appointments & services | 4, 6 | Book, explain, and confirm a service; handle a condition | plans, shopping | Permission, comparison, cost clarification, giving/receiving | 受付, 料金, 変更, 郵便局, 銀行 | Confirmation messages, price lists | Book, ask about a condition, handle an unavailable time |
| Health conversations | 7 | Describe symptoms and timing; check instructions; state uncertainty | services, home | Conditionals, ～かもしれません, request ladder | 病院, 薬, 熱, 痛い, 保険証 | Fictional appointment message, instruction sheet | Explain a fictional concern, check two details, state a remaining uncertainty |
| Housing & neighbors | 7 | Explain a household problem; discuss shared expectations | home, services | Conditions and exceptions, notice language | 家賃, 契約, 収集日, 故障, 修理 | Listings, building notices | Explain a maintenance issue, summarize a notice |
| When plans go wrong | 7 | Reconstruct what happened; negotiate and confirm a resolution | transport, services | ～てしまう, passive recognition, sequence | 忘れ物, 届く, 地震, 避難 | Incident accounts, follow-up messages | Resolve a fictional misunderstanding with a timeline |
| Ideas & opinions | 8 | Give a qualified opinion; summarize another view fairly | friends, problems | Stance, certainty, connectives | 意見, 理由, 賛成, 反対 | Opinion column, discussion thread | Discuss an issue, summarize the other view, qualify a claim |
| Reading the world | 9 | Follow, summarize, and critique connected texts | work, friends | Cohesion, reference, quoting | 記事, 情報, 結果 | Articles, reviews, interviews | Summarize, cite evidence, discuss an alternative reading |
| Stories & experiences | 9 | Tell an experience someone can follow; respond to theirs | friends, plans | Narrative aspect, reported speech, causative | 経験, 気持ち, 旅行, 思い出 | Personal essay, short story | Put an experience's events in order, answer two follow-up questions by choosing replies, choose the reflection that fits |
| Belonging locally | 10 | Take part in a local plan; read a community message | housing, opinions | Purpose clauses, formal community register | 地域, 参加, 行事, 当番 | Newsletter, event notice | Read an announcement and take part in a shared-plan conversation |
| Food beyond the table | 10 | Follow and explain a recipe; adapt it; share its story | restaurant, home, stories | ～ておく, recipe sequence, substitution reasons | 材料, 切る, 焼く, 煮る | Recipe, food memoir | Explain a dish, adapt it, discuss a memory |

### Kanji growth

**The intent** (owner, 22–23 October 2026). Kanji is the one part of Japanese that can make a beginner feel they are learning nothing, and the first version of this course did exactly that: it split each kanji into labelled parts, and a learner with no kanji had no parts to recognise, so the drills taught shapes with no meaning or sound attached. The replacement rests on six decisions.

1. **Kanji is a reading skill, learned as words.** What the learner needs is to see お水 in a sentence and know that it is water, read みず. Not to analyse 水, not to write it, not to know its other readings yet. So every kanji is taught inside a word, by its meaning first and its reading second, and tested in a sentence.
2. **The course sets the pace: one to three words a lesson.** Kanji trickles in with the content. A lesson teaches its few, a practice a few more, a book one or two. The learner never meets a kanji the course has not introduced, and nothing is tested before it is taught.
3. **The text itself shows what you know.** Each word appears in the stage the learner has reached: kana, then kana with the kanji small above it, then kanji. Progress is visible in every sentence, lesson and book rather than in a score, and reading grows harder without ever becoming unreadable. The books show whatever the learner has mastered.
4. **Mastery is demonstrated, not accumulated.** A word is known once the learner has passed its trial on three different days: meaning, reading and use, all right, three times. No points from lessons, no partial credit, nothing to grind.
5. **A miss costs nothing.** The card closes for the day and the word tries again tomorrow. The only consequence of forgetting a known word is that its reading comes back until it is answered right. The round is a daily habit, not a test to fear.
6. **The Kanji page is the round and nothing else.** Nine words on paper; a circle for a pass, faded ink for a miss; no counters, labels, pills or lists. What the learner has collected, and how far each word has come, lives in Library with the rest of their words. The area is there to be used for a few minutes a day, not read.

The aim from the first lesson: a learner who knew no kanji sees お水 in お水をください, knows that 水 means water, and can choose its reading, みず. The rules below follow from the six decisions.

- **Unit of learning: the written word.** A kanji word is its written form with the reading it has in context: 水 (みず) in お水, 出口 (でぐち) on a station sign. Progress belongs to the word, not to the character. Knowing 水 as みず says nothing about 水曜日 (すいようび), which is a separate word with its own progress.
- **Slow introduction.** A lesson introduces 1–3 kanji words from its word table, chosen because they are useful and simple in meaning. The first lesson, *Ask for something*, introduces 水 and 茶 and leaves お願いします in kana. Practices introduce a few more of their own, and books at most one or two. Every other word stays in kana until a lesson or practice introduces it.
- **Meet, mean, read.** An introduced word appears in kanji in a sentence, with its reading above it. Drills follow at once: choose what it means in that sentence, choose its reading with the reading hidden, then find it on a menu, sign or message. Wrong options come from the learner's other kanji words and the same lesson's words, never from kanji the learner has not met.
- **Kanji cards.** Every introduced word joins the learner's kanji words, listed in Library → Dictionary (Kanji words) with each word's trials. The Kanji page, a sidebar entry of its own (not a Practice set), holds only the daily round. Once 9 words are met, the round opens: a 3×3 grid of 9 cards, a new round each day.
  - Each card shows one kanji word. Tapping it opens its trial, once a day: always three questions, one after another. First *What does this word mean?* (its gloss and three others), then *How is this word read?* (its whole reading in kana and three others, close in shape where possible), then *Which sentence does it fit?*: three sentences, each with a blank, shown in the learner's stages. The word's kanji is on the card, not in the sentences.
  - All the wrong options belong to the learner's other met kanji words. The right sentence is the word's intro line from its lesson on its first trial, and a new sentence written for the trial after that. Two sentences whose blanks take the same kind of word (a drink, a place, a time…) are never shown together, and the wrong sentences come closer as the word passes: another part of speech at first, then the same part of speech from another lesson, then from the same topic.
  - A trial passes only when all three answers are right. The first wrong answer shows its feedback and closes the card for the day, with nothing taken away.
- **Mastery: three passed trials.** A word is mastered (known) after three passed trials on three different days; a word passes at most one trial a day, and a replay of the round counts for nothing. Answers in lessons, practices, books and the reading check never count towards it: a right one marks the word met, and a wrong one brings a known word's reading back. Known words come back in later rounds as review, after the words still being learned: a pass changes nothing, and a miss brings the reading back.
- **Revised by the owner on 29 October 2026: text is kana; Show all kanji shows mastered kanji.** Wherever Japanese appears (lesson sentences, questions, answer options, tiles, dialogues, practices and books), kanji words show in kana. With *Show all kanji* on, each word the learner has mastered shows in kanji, its reading a tap away, and every other word stays kana. What counts as mastered (for now, a known word; in the course, a met word whose kanji are all known on its character track) is provisional and will be settled when the Kanji section is revised. The stages below are still recorded and drive the Kanji page; as first built (22–23 October), text showed them:
- **Three stages per word.** Each kanji word showed in the stage the learner had reached:
  - *Not met:* plain kana, おみず.
  - *Met, not yet known:* kana with its kanji small above it, the *Kana + kanji above* style, so the learner keeps seeing 水 over みず in sentences between card rounds.
  - *Known (three passed trials):* kanji, お水, with its reading a tap away.
- **Known words stay in kanji.** A wrong answer about a known word puts its reading back above it until it is answered right again or passes a trial; the word itself stays in kanji. English stays English: the translation "water" never changes.
- **Compounds and names.** A kanji compound that is not a vocabulary word yet, such as 本屋 or 公園, follows the words its kanji appear in, and shows in kanji once each of its kanji is known in some word; people's names and places always stay in kana.
- **One switch: Show all kanji.** The four reading modes give way to the stages above and one switch, off by default. As first built, turning it on showed every kanji word in kanji with its reading above, for reading ahead; since 29 October 2026 it shows only mastered words in kanji. It records no evidence, never shows a reading-question target's reading, and turning it off returns every word to its stage.
- **Text that keeps its spelling.** Some items show a fixed spelling whatever the learner knows: a reading question (the kanji is shown and its reading hidden), a spelling pair such as おばさん／おばあさん, and any question whose answer is the kana itself. Authors mark these items.
- **Later: written forms.** Choosing the right kanji for a reading from IME-style candidates can come later as a reversed card. Handwriting is not practised.
- **Scale check:** the 2,136 [jōyō kanji](https://en.wikipedia.org/wiki/J%C5%8Dy%C5%8D_kanji) are the long-range ceiling for ordinary text. The ~720 words by Arc 10 cover a few hundred characters. That is enough for supported everyday reading, and the curriculum does not claim more.

Settled by the owner later on 22 October 2026: a met word shows its kanji small above the kana until it is known, and the reading toggle becomes the one *Show all kanji* switch. Revised by the owner on 23 October 2026: the pacing of 10 points (one a day, one lost per miss, from any answer) gave way to the three-question trial and mastery after three passed trials, with nothing ever taken away.

The build runs in five phases: engine, stages on screen, lessons, Kanji cards, then follow-ons. The phases, and the files each one touches, are in [data-contract.md](data-contract.md#kanji-words). Phases 1–4 are built (23 October 2026):
- every lesson teaches 1–3 kanji words;
- text shows each word in the learner's stage, with one *Show all kanji* switch (since 29 October 2026: text is kana, and the switch shows mastered words in kanji);
- Kanji cards runs on its own Kanji page (moved out of Practice on 23 October 2026);
- the parts drills and kanji meaning checks are gone.

The follow-ons are still open.

The course profile's character track is built (29 October 2026): its Kanji page teaches Nihongo Challenge's 310 kanji as sets of ten, in place of this word round. It is specified in [course-curriculum.md](course-curriculum.md#the-kanji-page) and [data-contract.md](data-contract.md#kanji-characters).

#### Two editions

*Owner, 28 October 2026.* Niwa is splitting into two content profiles ([builds.md](builds.md)). The personal profile keeps the six decisions above, and the rules that follow from them, as its defaults. The course profile (the classroom-support build) follows にほんごチャレンジ N4・N5 かんじ (built 29 October 2026): its Kanji page teaches the book's 310 kanji (N5, then N4) in book order, one book lesson of ten kanji at a time. The engine takes them as a character track in the content ([data-contract.md](data-contract.md#kanji-characters)). The personal profile has no track and is unchanged.

*Revised 29 October 2026, the set model ([data-contract.md "Kanji sets"](data-contract.md#kanji-characters)):* the course's first build, a daily trial per character with points and a kanji known after three passes, is replaced by sets. The learner reads each kanji of a set, then answers the set's practice, and finishing it opens the next set. Character mastery is undefined for now, so nothing is known on the Kanji page and the plain-kanji reward stays wired but inert.

### Passage recall ladder

Passage difficulty grows along separate dimensions: length, unknown-word density, syntax, inference demand, and support. Character ranges below are typical, not levels.

| Arcs | Typical text | Typical length | Recall mode | Delay |
|---|---|---|---|---|
| 0 | Price tag, sign, one menu line | 1–3 lines | Open book, then hidden after one look | Next session |
| 1 | Menu + exchange, flyer, intro card | 60–150 characters | Closed-book recognition | 1 day |
| 2 | Message, invitation, schedule | 150–250 | Closed-book cued recall | 3 days |
| 3–4 | Notice, route, reservation conditions, diary | 250–450 | Sequence reconstruction; condition tracking | 7 days + transfer |
| 5–6 | Email, blog post, review | 400–700 | Idea-unit recall | 7 days + unseen text |
| 7–8 | Instructions, notices with exceptions, long review, opinion column | 600–1,000 | Idea-unit recall + "cannot conclude" | 7 and 30 days |
| 9–10 | Article, essay, story, newsletter, two related texts | 900–2,000 | Summary choice + synthesis | 7 and 30 days |

Known-word coverage, before glossary support, should be about 95–98% of running words. 98% is the usual threshold for comfortable unassisted reading ([Hu & Nation, 2000](https://aila2021.dryfta.com/program/abstract-archive/abstract/public/416/unknown-vocabulary-density-reading-comprehension-and-the-98-coverage-figure-replicating-hu-nation-2000)). The glossary covers the rest. The full protocol is in [content-standard.md](content-standard.md#passage-recall-protocol).

## Two routes through the same content

**Situation route:** "I want to manage a meal out." The app assembles the core restaurant sequence and introduces small grammar bridges when needed.

**Structure route:** "I keep misunderstanding why this particle is here." The app opens the canonical explanation, contrasting examples, and links to situations where the distinction matters.

The sequenced arcs are the default situation route. Learners can still inspect any node and attempt its placement task; the arcs order recommendations, not permission. Structure should remain inspectable; hiding explanations defeats the learner's goal.

## Shared skills and deliberate overlap

| Skill | First meaningful encounter | Later transfer |
|---|---|---|
| Requests and attention | Foundation, restaurant menu, konbini counter | Help at work, appointments, offices |
| Topic and recoverable omission | Foundation, menu follow-up | Introductions, stories, reading reference |
| Quantity and classifiers | Ordering, shopping | Grocery shopping, scheduling, measurements, recipes |
| Place, existence, and movement | Shopping and transport | Home, housing, community |
| Time, tense, and aspect | Routines and plans | Experiences, progress reports, longer narratives |
| Negation and restriction | Unavailable food, cash only | Scheduling limits, conditions in notices |
| Reasons and contrast | Preferences | Requests, opinions, argument and reflection |
| Conditions and exceptions | Reservation conditions | Housing notices, health instructions, community rules |
| Clarification and repair | Foundation | Every node; extended negotiation later |
| Register and relationship | Service recognition | Friends, work, formal messages |
| Written words in kanji | Prices, signs, menu labels | Timetables, notices, articles |
| Cohesion and inference | Short connected readings | Reviews, essays, media, discussion |

An overlap is useful when the intention, partner, input, or constraint changes. Repeating the identical recognition item under a different topic label adds little. Track exposures by word/skill ID in the eventual content engine.

## Progression rules for the full product

1. Let learners inspect every node and try a placement task. Locks should explain missing skills, not merely demand more taps. A unit opens on its Focus text ([content-standard.md](content-standard.md#focus)), not on guesses, and offers no fast-track: placement stays at the node level.
2. Treat the foundational request and repair outcomes as bridges, not a long preliminary grammar course.
3. A core-stage pass can open several neighboring topics. Do not require all depth stages or optional vocabulary packs first.
4. A deep-stage entry check references particular skills, such as past narration or giving reasons. Passing equivalent tasks elsewhere can satisfy it.
5. Keep separate records of exposure, coached practice, immediate retrieval, delayed retrieval, and independent performance.
6. A stage is ready for a mastery claim only after an unfamiliar task and a later transfer task. Define the rubric in advance.
7. A gap directs a small review or bridge lesson; it should not reset an entire completed node.
8. New lessons are recommended only while the current arc's delayed retrieval holds. Otherwise review takes the new-learning slots.
9. An arc's consolidation gate must be passed, or explicitly skipped by the learner with the gap recorded, before the next arc becomes the default recommendation.

Suggested editorial thresholds are adjustable product defaults: all critical scenario functions achieved; no unresolved meaning breakdown; satisfactory comprehension, sentence building, interaction choices, and repair. Numeric defaults are in [content-standard.md](content-standard.md#evidence-based-progression). Validate thresholds in a pilot instead of treating an arbitrary percentage as science.

## Prototype progression

The garden shows only open or revealed stones. Open topic panels list playable lessons in teaching order and keep unwritten titles under Planned lessons. All playable lessons are textbook units ([content-standard.md](content-standard.md#a-complete-lesson)): a lesson is finished when every item has been answered correctly, with wrong items retried and first-try results kept as the score. Every item receives authored feedback. Practice sets and books open on their own prerequisites ([learning-loop.md](learning-loop.md)): *Restaurant review: a full visit* opens once r01–r04 are finished, and *Everyday dishes* once the review is. Every exercise is answered by tap or drag; there is no speaking or typed practice. These results show performance on the presented items; they do not establish fluency.

The review queue starts at one day and moves through three, seven, fourteen and thirty days. The optional six-item lesson reviews in Practice and the due list in Reading (2026-10-25) were removed on 2026-10-29 at the owner's direction; reviews stay parked. A due passage still opens on its delayed recall set on its own page. Today, review-debt gating and full-course retention-based pace control remain parked or unbuilt; prerequisites and due checkpoints govern lesson access ([requirements](requirements.md#reviews-are-parked)).

The prototype implements closed-book passage recall with delayed question sets and harvested phrases for its authored passages, and furigana fading. It also has five unseen transfer texts (a notice, a message, a receipt, a menu and a sign), each in a venue no lesson teaches and written only from the words and patterns of its source lessons. A text opens on its own prerequisites, its lessons finished and the books before it completed, with no delayed recall; its first reading is read once, answered from memory, and checked once more after a delay. It does not yet implement arcs or arc-gate tasks; those are specified here and in [content-standard.md](content-standard.md) for the next build.

### Playable coverage

| Topic | Playable lessons (of planned titles) | General practices | Books under its lessons |
|---|---|---|---|
| Basic sentences | f01–f03 (3 of 9) | 3 | pf01–pf03 |
| Restaurants | r01–r04, r06–r09 (8 of 48); *Without onions, please* (once r05) is an optional practice under r03 | 8 | p01, p03–p10 |
| Shopping | s01, s02, s04–s06 (5 of 9); *Sizes and colors* (once s03) is an optional practice under s02 | 5 | ps01–ps04; unseen texts t01, t02 |
| Meeting people | i01–i06 (6 of 9) | 6 | pi01–pi06; unseen text t05 |
| Making plans | ba01, ba02 (Bridge A), pl01–pl06, bc01–bc03 (Bridge C) (11 of 14) | 11 | pp01–pp09, pbc01–pbc03 and p02; unseen texts t03, t04; optional pd01, pd02 |
| Getting around | tr01–tr03 (3 of 10) | 3 | pt01–pt03 |
| Home life | h01, h02, bb01 and bb02 (Bridge B) (4 of 12) | 4 | ph01, ph02, pbb01, pbb02 |
| Dating and relationships | none: its first four titles (once d01–d04) are optional practices under pl02 | none | none of its own: pd01 and pd02 are optional books under pl02 |

Each lesson is the home of one general practice and at least one book; [learning-loop.md](learning-loop.md#home-items) lists them. p02, a restaurant reservation, sits under pl04 because its late-arrival rule needs 遅れる. Every other topic, and Dating and relationships since loop 2b, is an outline with no playable lesson. The six practices made from lessons keep the titles they had in the catalogue. Every lesson, practice and book is a draft pending fluent Japanese review.

**Making plans.** pl01–pl03 cover the first stage's opening lesson and two of the second stage's three; pl04 opens Changing plans, and pl05 and pl06 follow it there; bc01 then opens Bridge C, and bc02 follows it; bc03 joins Bridge C from the end of the path. pl01–pl03 are authored ahead of their arc, so each teaches the forms it needs instead of assuming bridge A; pl04 comes after Bridge A and builds on it:

| Lesson | Section | Taught here | Reused from |
|---|---|---|---|
| pl01 When are you free? | Dates and times | 月曜日, 火曜日, 木曜日 and 何曜日; clock times with 時 and 半 (四時 よじ, 九時 くじ); から and まで; ［time］は空いていますか / 大丈夫ですか; the soft refusal ［time］はちょっと…; 来週 | ですね to confirm one detail (f02); 大丈夫 (s05); other weekdays and 午後 in supported examples/conversation do not make the *my-week* practice a lesson prerequisite. Assessed drills use lesson-chain teaching; the practice/book chain can also rely on *my-week* ([For educator review](#for-educator-review)) |
| pl02 Invite someone | Make a plan | Polite verbs in ます (行きます, 見ます, 食べます, 飲みます); ～ませんか to invite; ～ましょう and そうしましょう to accept; ［time］はどうですか to offer another time; 一緒に, 映画 | ちょっと, the days, 時 and 半 (pl01); いいですね (i04, i06) |
| pl03 Decide where to meet | Make a plan | で for the meeting place against に for a destination; ［place］の前 / 出口 / 改札; a clock time with に; と for the person you meet; どこで会いましょうか; checking who, when and where with ですね | ませんか, ましょう and はどうですか (pl02); 何時, 半 (pl01); 入口 (s01); 駅 (i03); 混む (r08); ですね (f02) |
| pl04 Running late | Changing plans | すみません、［time］ぐらい遅れます for a delay still ahead against 遅れました on arrival; minutes with 分 (ふん after 2, 5, 7 and 9, ぷん after 1, 3, 4, 6, 8 and 10); 電車が遅れています; もしもし; 映画館; moving the meeting point with ［place］で会いませんか and ［place］はどうですか; 先に入ってください for recognition only | ます against ました and the four endings (ba01); ましょうか (ba02); ませんか and はどうですか (pl02); で for the meeting place, 入口 and 出口 (pl03); 大丈夫 (s05); から for a reason (r07) |
| pl05 Dates and durations | Changing plans | Calendar dates with 何月 and 何日: ［N］月 (しがつ, しちがつ, くがつ) and ［N］日 with the special readings みっか, よっか, ようか, じゅうよっか and はつか; a starting clock time with から against elapsed hours with ［N］時間 (よじかん, くじかん) and ［time］かかります with ぐらい; 午前 and 午後, retaught because only the *my-week* practice had taught them. The other date readings are reference material on the 日 word card and in its practice | 時, 半, から and まで (pl01); 分 and ぐらい, 映画館 (pl04); 映画 (pl02); 駅の出口 and 会いませんか (pl03); どのくらい (r08); 時間 (r07), which gains an hours sense; ですね to confirm (f02, pl01) |
| pl06 Read a simple schedule | Changing plans | Two sign labels for recognition, 営業時間 (opening hours) and 定休日 (regular closing day); a printed 24-hour range (10:00〜18:00 or 10:00–18:00) read as ［start］から［end］までです, with 13:00–19:00 read as one to seven p.m.; ［day］は休みです for the closed day, with 水曜日; an event's start and end with ［time］に始まります／終わります (始まる, new, and 終わる), kept apart from its length, ［N］時間です; choosing a visit that fits the closed day, that day's hours and the event | から, まで, 休み, 何時 and 半 (pl01); 午前, 午後 and numbered 時間 (pl05); 映画 (pl02); 映画館 (pl04); 会いましょう (pl03); 勉強 (i04); カフェ (i05); 店 (r08); ですね to confirm (f02) |
| bc01 Please wait a moment | Bridge C: requests | The て-form from the dictionary form: る-verbs replace る (食べて, 見て); う-verbs change う/つ/る → って (会って, 待って, 入って), む/ぶ → んで (飲んで, 呼んで), く → いて (書いて) and す → して (話して); the special forms 行って, して and 来て (read きて); ［て-form］ください for one action, for agreed tasks and ordinary service requests, with a note on requests that are too direct; 書く, 話す and する; 呼ぶ in its summon sense, ［person］を呼ぶ; ちょっと for a short time. ぐ- and ぬ-verbs, ongoing states, desire, negative requests and action chains come later | 食べる, 飲む and 行く (ba01); 待つ (ba02); 見る (pl02); 会う (pl03); 入る, recognized in 入ってください (pl04); 来る (i03); 呼ぶ for a name (titles-and-names); the set phrase 書いてください (another-way); ちょっと (pl01); ［item］をください, retrieved in its まとめ (f01) |
| bc02 First this, then that | Bridge C: sequencing | Two actions in order, ［て-form］、［final verb］, with only the final verb carrying ます or ました; ［て-form］から for an action finished before the next starts, where a grammatical plain て sequence is never marked wrong and no item claims an exact gap; 買う and 帰る, in a lesson for the first time, with 買って and 帰って. Ongoing states, desire, multi-step directions and てから for “ever since” come later | The て-forms of 食べる, 飲む, 行く and 書く (bc01); ます and ました (ba01); 待つ (ba02); 会う (pl03); 駅 (i03) and 入口 (s01); お茶, お水 and コーヒー (f01); パン (f03, s02); ［item］をください, retrieved in its まとめ (f01) |
| bc03 May I use this? | Bridge C: permission | ［て-form］もいいですか to ask permission for your own action, set against ［て-form］ください, which asks the listener to act, with the situation, not the ending, saying who acts; the verb keeps its particle (を, に, で); the replies はい、どうぞ and いいですよ, which grant permission, and すみません、ちょっと…, a hesitant refusal, with a following てください saying what to do instead and a refusal giving no reason, length or later promise; ペン; 使う in its object sense with 使って, as a kanji word. でしょうか, だめ and てはいけません come later | The て-forms of 書く, 待つ and 入る, ［て-form］ください and ちょっと待ってください (bc01); ちょっと… as a soft no (pl01); 使う (r04); どうぞ (f01, r01); すみません (f01, f02); いい (r07); 入口 (s01); 駅 and 今 (i03); 名前 (i02); ［item］をください, retrieved in its まとめ (f01) |

Two passages recombine these in a walking club, a venue none of the units teaches: pp01 introduces an arrangement (day, time, meeting point, what to bring, a rain plan, a reply deadline), and pp02, the evening before, keeps the day and time but moves the meeting point. Both use closed-book recall with delayed sets; pp02's delayed set asks the learner to act on both messages together. The grammar catalog gains two patterns taught in pl02, invite-masenka and suggest-wa-dou. invite-masenka is now drilled in r08 as well (Bridge A, below); suggest-wa-dou is drilled in the optional Dating practices as well (once d02 and d03), but re-tests draw from lessons only, so it is re-tested within Making plans.

pp03, the morning of the walk, is a club member's message: the train is late, so the member will miss the 8:40 bus, plans to take the 9:10, has already phoned Kimura and bought rice balls but not a drink, and suggests meeting at the top of the mountain. Completed actions (ました) and the one that did not happen (ませんでした) are stated outright, so the delayed set asks what happened, what did not happen and where to meet, never for a translation. The 9:10 bus is only a plan in ます: a delayed inference item asks the learner to keep it apart from an outcome the message never states. pl04 drills invite-masenka and suggest-wa-dou again for a changed meeting, sets 遅れます against 遅れました (polite-nonpast, polite-past), and offers to wait with ましょうか (offer-mashouka); its まとめ word bank needs ました, ませんでした, ません and ます on 食べる and 行く. It adds no catalog teaching point.

pl05 Dates and durations (card 0038A, 2026-10-23) sits in Changing plans right after pl04 and requires only pl04; its title moved there from Dates and times. Its general practice, `dates-and-lengths`, adds the other special dates for recognition, with their readings shown, and keeps the date, the start and the length apart in new settings. Its book, pp08 *The film on the twentieth*, is a friend's two-paragraph film plan: the delayed set keeps the film's date, start and length apart from the meeting time and the trip. Every running word is taught by the chain. Both companions require only pl05. pl05's two checkpoint recipes, authored in its draft (assets-source/content-drafts/0038A.md), were held back while pl05 sat after the last checkpoint; they ship since checkpoint 7 takes it in (card 0042B).

pl06 Read a simple schedule (card 0038B, 2026-10-23) follows pl05 in Changing plans and requires only pl05; its title moved there from Dates and times, as pl05's did. Signs print clock ranges in Arabic digits (10:00〜18:00), which every reading stage shows as printed; dates stay in kanji numerals with their readings, and weekdays are written in full. 始まる is a new entry beside 始める (start something, late-and-changes), and its polite form makes 始まります link to it; 終わる (sold-out-ways) gains the event use in its definition and a polite form, 終わります. Its general practice, `hours-and-events` *Hours and events*, adds a weekday line that changes the usual hours and event notices with dates or lengths in hours and minutes, and compares proposed visits. Its book, pp09 *Thursday at the cinema*, is a friend's message with the cinema's sign and the film's details: the recall sets keep the start apart from the meeting time and the end, the length apart from the ending clock time, and the closed Tuesday apart from the film's Thursday. Every running word is taught by the chain. Both companions require only pl06. pl06's two checkpoint recipes ship with it, since it sits inside checkpoint 7 ([The general sequence](#the-general-sequence)).

bc01 Please wait a moment (card 0042A, 2026-10-23) opens Bridge C: requests, a new last stage of Making plans. It requires only pl04, whose chain teaches every verb it forms, and sits after pl06 on the path so that Changing plans stays one section on the topic page. Its general practice, `counter-requests` *At the shop counter*, moves the requests to a shop counter, switching between what the assistant and the customer need, and keeps 来て (towards the speaker) apart from 行って. Its book, pbc01 *Three errand notes*, gives three helpers one request each; the recall sets keep each person with their job and place, and a request apart from a report that it has happened. Every running word is taught by the chain. Both companions require only bc01. The set phrase 書いてください keeps its own dictionary entry and its pf02 references, while new writing requests link to 書く in its request form; 呼ぶ gains a summon sense beside its naming one. bc01's three checkpoint recipes, authored in its draft (assets-source/content-drafts/0042A.md), were held back while bc01 sat after the last checkpoint; they ship since checkpoint 7 takes it in (card 0042B).

bc02 First this, then that (card 0042B, 2026-10-23) follows bc01 in its own stage, Bridge C: sequencing, and requires only bc01. It joins two actions with the て-form and makes completion explicit with ～てから; a grammatical plain て sequence is never marked wrong for lacking から. 買う and 帰る, met before only in practices and books, get their first lesson under their existing IDs, with new て-forms (and 帰りました). Its general practice, `housemate-sequence` *Before we go out*, moves the plans to two housemates, keeping who does what, the order, and a plan apart from a past report. Its book, pbc02 *Getting ready for tomorrow*, is a housemate's message with tomorrow's preparations in order and yesterday's finished errand; the recall sets keep each order, the waiting place and the meeting, and a planned ～てから apart from a report that the first action has happened. Every running word is taught by the chain. Both companions require only bc02. The catalog gains te-sequence and te-kara. te-sequence is also drilled in tr03; te-kara still has tagged drills in bc02 only.

bc03 May I use this? (card 0050, 2026-10-23) is appended after tr02, in its own stage, Bridge C: permission, and requires only bc01, so no checkpoint block moves. It asks permission for your own action with ～てもいいですか and keeps it apart from bc01's requests; the situation, not the ending, says who will act. 使う, met in r04 for payment and in p03 for ingredients, gains an object sense, its て-forms and its kanji-word introduction; ペン is the only new word. Its general practice, `permission-in-company` *Permission in another place*, moves the questions to a friend's home and a community event, with new partners and intentions. Its book, pbc03 *At the sign-in desk*, has Sato ask Tanaka three questions: unlike the lesson conversation, entry and writing are allowed and the pen is refused, and Tanaka's following request offers another item. The recall sets keep each answer and keep the missing reason, and any later permission, out of the exchange. Every running word is taught by the chain. Both companions require only bc03. The catalog gains permission-te, drilled only in bc03 until a later lesson builds on it. bc03's two checkpoint recipes, authored in its draft (assets-source/content-drafts/0050.md), now ship in checkpoint 8 after tr03.

Loop Phase 4 (2026-10-23) gave every Making plans lesson a general practice and a book: `everyday-verbs` and pp04 (ba01), `offers-and-replies` and pp05 (ba02), `times-of-day` and pp06 (pl01), `kind-replies` and pp07 (pl02), and `meeting-points` (pl03) and `late-and-changes` (pl04), whose books were already pp01–pp03. p02, the restaurant reservation with a late-arrival rule, moved under pl04, and t03 and t04 sit under pl03.

Still unbuilt in Making plans: Accept or suggest another time (a fuller treatment of declining with a reason), and two of Changing plans' titles: Cancel and explain, and Confirm the revised plan. Dates (～月～日) are taught in pl05; Bridge A's past and negative forms now are, in ba01 (below). These units are the taught prerequisites of Dating and relationships (below) for asking someone out, agreeing a time and place, and confirming them.

**Getting around.** tr01 opens Finding your way after pl04, in place of the unbuilt title *Where is the station?*. tr02 Does this train stop there? (card 0040B, 2026-10-23), a new title, follows it and requires only tr01. tr03 Follow a short walking route (card 0049, 2026-10-24) fills the planned title *Left, right, and across*: it is appended after bc03 and requires tr02 and bc02. The stage's last title, Read a station sign, is still unbuilt, and so are Taking the train and Delays and mistakes.

| Lesson | Section | Taught here | Reused from |
|---|---|---|---|
| tr01 Which platform? | Finding your way | ［place］行き and ［place］行きの［vehicle］, a destination label, against the verb sentence ［place］に行きます; 何番線ですか for a platform number and ［number］番線はどこですか for where it is; バス; kanji words 番線 and 行き (also read ゆき, never offered as a wrong reading) | 駅はどこですか, retrieved once (駅 i03, どこ s01); 電車 (pl04); 何 and この (r06); 行きます (ba01); すみません for attention (f01); こちら (f02) |
| tr02 Does this train stop there? | Finding your way | この［vehicle］は［place］に止まりますか, checking a stop, against ［place］に行きますか, answered with 止まります or 止まりません (は after に for the stop denied); 次は［station］です on a display and 次の駅; ［place］で降ります for where you get off; kanji words 止まる and 降りる; 次 gets its core Words-table home (late-and-changes, optional, taught it first) | 電車, バス, この, 行き and 駅 (tr01, pl04, pl03); ［place］に行きます and the polite negative ません (ba01); すみません for attention (f01) |
| tr03 Follow a short walking route | Finding your way | この道をまっすぐ行ってください and ［landmark］を［right/left］に曲がってください, with を for the road followed or the turning point and に for the direction; two route steps linked with ～て、…てください; ひとつめの／ふたつめの［landmark］, counting only the named landmarks; ［place］の隣です against ［place］の右／左です from a stated view; right and left always from the walker's stated facing; kanji words 道 and 曲がる; 右, 左 and 隣 get their core Words-table home (the practices shelf-and-floor and meeting-points used them first) | ～てください and the う-verb て-form (bc01); ～て、～ for two actions in order (bc02); 次 (tr02); 駅, この and どこ (tr01, i03, s01); 前 (pl03); 出口 (s01); コンビニ (i03); レストラン (ba01); すみません for attention (f01) |

Its practice, `platform-and-bus`, reads bus-stand signs: ［number］番のりば, a numbered stand, against ［number］番のバス, a numbered bus, with のりば for recognition. Its book, pt01, is a station notice that pairs two trains with their platforms and the Aoba bus with its stand, then says where the bus boarding area is. It gives no times, so its recall sets ask what the notice leaves out. Four earlier drills used バス before any lesson taught it; pl01-C4 now asks a time on its own, and pl04-D4, F2 and J1 use 電車, with their IDs, answers and counts kept.

tr02's practice, `stops-and-destinations`, reads departure boards with two service labels for recognition, 急行 (express) and 普通 (local), and keeps them apart from the printed stop lines: a label never stands in for a stop pattern, journey time or fare. Its book, pt02 *The next-stop notice*, is an onboard display: Hinata is only the destination label, Aoba is next and a stop, and Sakura is ruled out. It gives no times and nothing after Aoba, so its recall sets ask what the notice leaves out. The kanji check sentence station-2, 次の駅で降ります, became a tr02 example, so it now reads さくら駅でわたしも降ります with the same ID and target.

tr03's practice, `walking-landmarks` *Across the bridge*, adds a bridge and a police box as landmarks: はしをわたって comes before the next step, a following corner is counted from where the crossing ends, and one route is tried again from the opposite facing. わたる and はし are new, and 交番 (until now only in the optional meeting-points) gets its general home there; its final set retrieves six of the lesson's route steps. Its book, pt03 *A route to the restaurant*, is a friend's message: straight along the road in front of the exit, left at the first corner, and a restaurant beside a café, on its right as you face it. Unlike the lesson, the turn is left at the first corner and the landmark is a café, so the lesson's facts do not answer the recall; the recall sets keep the turning point, the direction and the landmark chain, and ask what the message leaves out. Every map is text rows on a card with a stated start and facing; the main and transfer questions, which cannot show a card, state their map in the prompt.

### Home life

**Your home.** h01 (card 0039, 2026-10-23) opens Your home straight after s01 and requires only s01. It keeps to finding things: routines, household requests, negatives, people and pets, left and right, and front and back stay with later units. h02 Where is everyone? (card 0048, 2026-10-23), a new title after There is a table, takes up people and pets. It follows i03 and requires h01 and i03; no lesson requires it.

| Lesson | Section | Taught here | Reused from |
|---|---|---|---|
| h01 There is a table | Your home | ［place］に［N］があります to introduce what is in a place (が, new information), against s01's ［N］は［place］にあります for a known item; ［N］の上・下・中 against furniture and containers (上 is on the surface here, and can also mean above); 部屋, いす and かぎ (new), with テーブル, 本, 箱, 上, 下 and 中, which only practices had taught; kanji words 上 and 下 | ［N］は［place］にあります, ［place］の近く, 入口, どこですか and ですね (s01); お茶 (f01); 傘, 電池, 卵, 牛乳 and サンドイッチ (s01) |
| h02 Where is everyone? | Your home | います for a person or animal against あります for a thing, in h01's ［place］に［N］が and ［N］は［place］に frames; ［place］にいますか and どこにいますか; いません for someone not in the named place, an absence that gives no other location, and 今、いません; existential いる (a new record beside need's いります／いりません), 犬, ねこ and 外 (new); kanji words 犬 and 外; ねこ and いる stay in kana | ［place］に［N］があります, ［N］は［place］にあります, 部屋, いす, テーブル, かぎ, 本, 箱 and ［N］の上・下・中 (h01); ［place］の近く, 入口, どこ and ですね (s01); さん (i02); 今 (i03); 住んでいます, recognized as a different chunk (i03) |

Its practice, `home-other-room` (*In the guest room*), moves to a host's guest room and asks the learner to follow two clues at once, a box under a chair and a book inside the box; it adds s01's ［place］の近く against furniture. Its book, ph01 *A note from your housemate*, is Ken's five-sentence note about Ken's room: the recall sets ask for the objects used as clues (the table, the box) as well as the answers (the key, the book), and what the note leaves out. Every running word is taught by h01's chain.

h02's practice, `people-and-pets` (*In a different room*), moves to a community centre: room reports that keep people and pets (います／いません) apart from objects (あります), and two changed-room items that read the current note, not an old one. Its book, ph02 *Before you look for Ken*, is a six-sentence note on a shared home's message board: Ken outside, Mina only not in the room, the dog by the entrance, the cat in the box near the chair and the book on the chair. None of these is stated or rehearsed in the lesson or the practice, and the recall sets keep Mina's absence from becoming a location. Every running word is taught by h02's chain. Both companions require only h02. Every います, いますか and いません in the three is an explicit reference to existential いる (`iru-exist`); need's いりますか and いりません keep their references ([data-contract.md](data-contract.md#word-occurrences)). h02's four checkpoint recipes ship with it, since it sits inside checkpoint 3.

**Bridge B.** bb01 (card 0041A, 2026-10-23) opens the outline stage *Bridge B: adjective descriptions*, listed before Your home; topic pages order lessons by the path, so h01 comes first there. It sits right after i06 and requires i06, s04 and r08. pl02 now also requires it, because pl02-R4 retrieves its いい → よくないです; pl03-R2 retrieves its な-adjective negative, through pl02.

| Lesson | Section | Taught here | Reused from |
|---|---|---|---|
| bb01 Describe what is and isn’t | Bridge B: adjective descriptions | Adjective class learned with the word, not read off the last kana: い-adjectives (大きい, 小さい, いい) with です and くないです, and the irregular いい → よくないです; な-adjectives (きれい, 静か, にぎやか) keep the whole word before です and じゃないです; ではありません recognized as the formal negative; kanji word 部屋 | 辛くないです and 得意ではありません as chunks (r06, r07); でも (r08); この and あの (s02); quiet and lively, recognition in i06, become active; 部屋 is h01's record |

Its practice, `describe-everyday`, uses the same contrasts in new rooms, cafés, shops and food. Its book, pbb01, is a friend's voice message from inside one of two rooms, about both rooms and a café seen from the window; its recall sets ask which room the friend prefers and what the message says about the café and its curry, and that it gives no prices. Patterns `adjective-i-present` and `adjective-na-present` are catalogued with it.

bb02 (card 0041B, 2026-10-23) follows bb01 in the same stage and requires only bb01. It takes the same eight adjectives into the past, and keeps each past description apart from the present: a description of yesterday never tells you how things are now, so a present form is asked only where the situation states the current state, and a size is tied to what was seen that day (きのうの［N］). pl02 now also requires bb02, because pl02-R2 retrieves its よくなかったです; pl03-R7 retrieves its な-adjective past, through pl02. r08-G3 and r08-G4 are tagged `adjective-i-past`, so r08's food story is a re-test venue for the past forms it first met.

| Lesson | Section | Taught here | Reused from |
|---|---|---|---|
| bb02 Describe yesterday and now | Bridge B: adjective descriptions | い-adjective past with かったです and くなかったです, including いい → よかったです and よくなかったです; な-adjective past keeping the whole word before でした and じゃなかったです, きれい included; time anchors (きのう, きょう, 今) that keep a past description from standing for the present; kanji word 静か | おいしかったです and 辛かったです (r08); the present forms and the eight adjectives (bb01); きのうの［N］ (r08); でも (r08); この and あの (s02); 部屋 (bb01) |

Its practice, `yesterday-and-now` (*Yesterday and now*), uses the same contrasts in changed rooms, cafés, shops, stations and food. Its book, pbb02 *Two visits to the same café*, is a friend's message from a café they visited yesterday and again today; its recall sets ask which atmosphere, curry and room description belongs to which time, and what the message does not say (tomorrow, prices). Patterns `adjective-i-past` and `adjective-na-past` are catalogued with it. The lesson adds 14 past forms to existing records and no new headword.

### Dating and relationships

Decided on 22 October 2026 and built in loop 2b the same day: Dating and relationships is **optional content** ([learning-loop.md](learning-loop.md#optional-content)). Its four lessons are optional practices under *Invite someone* (pl02), and its two books, pd01 and pd02, are optional books. The node `dating` (entry level 2, prerequisites Meeting people and Making plans) stays in the catalogue as an outline: it has no playable lesson, so it has no stone. The practices keep their units' Focus, Words tables, new words, conversations and drills, item IDs included, and open one after another:

| Practice (once the lesson) | Requires |
|---|---|
| `dating-interests` Find shared interests (d01) | pl02, i05 and i06 |
| `dating-ask` Ask someone on a date (d02) | Find shared interests, and pl01 |
| `dating-confirm` Confirm or change the date (d03) | Ask someone on a date, and pl03 |
| `dating-feelings` Say how you feel and set boundaries (d04) | Confirm or change the date, and ba02 |

pd01 requires pl03, *Ask someone on a date* and `my-week`; pd02 requires *Say how you feel and set boundaries* and `my-week`. Since loop Phase 3 they open on those prerequisites and sit on pl02's shelf in Library → Reading, after its general book ([learning-loop.md](learning-loop.md#the-app-today)), and no lesson reaches the Dating topic any more. All four sets and both passages are drafts pending fluent Japanese review. The notes below keep the lesson IDs the content was written under.

**Node brief.** The situation is an adult getting to know another adult and perhaps dating them: interests, an invitation, a change of plan by message, how the date went, and what each person wants next. The boundaries of the stage are deliberate: the units keep a friendly outing apart from an explicitly agreed date, and never let politeness or silence count as interest or agreement. Characters are varied adults (Aoki, Ito, Mori, Sam and Ueda, Ren and Yui), referred to as they in English, and no answer depends on anyone's gender. Practical outcomes: choose an activity from shared interests; ask someone out so the intent is clear; accept or decline clearly; follow and confirm a changed plan; say how a date went; recognize a request to become a couple and answer it; state a boundary and respect one. Venues: a community-centre climbing club, messages, a café after a film; the passages use a book club and a cooking class, which no unit teaches.

| Practice (once the lesson) | Section | Taught here | Reused from |
|---|---|---|---|
| d01 Find shared interests | First dates | 趣味は何ですか; 大好き beside 好き; ［A］と［B］、どちらがいいですか answered with ［N］がいいです, or どちらもいいです, which chooses nothing; ライブ | も and は (i05); どんな and いいですね (i06); が for a preference (r07, i05); 映画 (pl02); 週末 (i05) |
| d02 Ask someone on a date | First dates | デートしませんか; ふたりで against みんなで; よかったら; ぜひ and 楽しみです for yes; うれしいです。でも…ちょっと… for a kind no; わかりました to accept a no; 今度 | ～ませんか and ましょう (pl02); 空いていますか and ちょっと… (pl01); ふたり (r01) in a new job; でも (r08) |
| d03 Confirm or change the date | First dates | Reading a change by message; ［time］まで仕事です as a brief reason; ［N］にしましょう to settle a new time; では、［day］の［time］に、［place］ですね for the final plan; 返事, メッセージ | はどうですか (pl02, tagged suggest-wa-dou); で, に and ですね for a meeting (pl03); にします (i05); 大丈夫 (s05) |
| d04 Say how you feel and set boundaries | Feelings and boundaries | 楽しかったです; また会いたいです (chunk); 付き合ってください (recognized); はい、よろしくお願いします and ごめんなさい。友達でいたいです as clear answers; お酒は飲みません and きょうはもう帰ります as boundaries; わかりました without asking why | ません against ませんか (ba02, tagged polite-negative); よろしくお願いします (i01) in a new job; 友達 (r08); ぜひ (d02) |

**Bounded chunks and deferred depth.** また会いたいです and 友達でいたいです are learned whole; the たい form is derived in Bridge C. 付き合ってください is recognized, not built. Feelings words, compliments, casual register with a partner, and anything about intimacy or a relationship's later stages are deferred: Feelings and boundaries continues with A thank-you message after a date and Turn down a second date kindly, and Being a couple waits for plain forms (Bridge D). 音楽 and 予定 are used with readings but stay out of the practices' Words tables, because general lessons (i06, pl02) already use them and an optional practice may not be the only place a general lesson's word is taught.

**Patterns and transfer.** The points re-use catalog structures rather than teach them again, so only their drills are tagged: question-words and ga-preference (d01), invite-masenka, confirm-desu-ne and suggest-wa-dou (d02), suggest-wa-dou, ni-shimasu, confirm-desu-ne and request-wo (d03), polite-negative (d04). Each set has a まとめ transfer item in a changed venue or relationship (a work welcome party, a neighbour, a team leader, a bike shop, a coworker). The lessons' transfer checks and checkpoint recipes went with them in 2b: checkpoints count lessons only.

**Passages.** pd01, a date that moved, is a five-message thread: Sam asks Ueda out for Sunday at twelve, Ueda accepts but works until one, the time moves to two, lunch becomes cake and coffee, and the park entrance stays. Its delayed set asks why the time changed and what Sam should tell a friend who still thinks it is twelve. pd02, a clear answer, is Ren asking Yui out and Yui answering うれしいです。でも、ごめんなさい。デートはちょっと…, wanting to stay friends and suggesting tea with the class; Ren answers わかりました. Being glad to be asked is a non-critical idea unit and the no is critical; the immediate set asks what the messages cannot tell us (why Yui said no), and the delayed set asks what fits when Ren sees Yui at the next class. Both use closed-book recall with harvested phrases and recovery sentences.

### Bridge A, the verb family

Two units in their own section of Making plans, placed in the general sequence just before r08 ([The general sequence](#the-general-sequence)). They use only earlier units and their own word tables, never pl01–pl03. Both are drafts pending fluent Japanese review.

| Lesson | Points (pattern) | Words table | Reused from | Counted items |
|---|---|---|---|---|
| ba01 Do, don’t, did, didn’t | ます against ました (`polite-nonpast`); ません and ませんでした (`polite-past-negative`) | 食べる, 飲む, 行く, わかる, 毎朝, きょう, きのう, and あした (new) | わかりました and もう一度 (f02), だけ (r04), あまり (r06), きょう (r07), 駅 and 近く (i03), 会社, 大学, パン屋 and 勉強 (i04) | 49 |
| ba02 Let’s, shall we, won’t you? | ましょう against ましょうか (`offer-mashouka`); ～ませんか against a plain ません (`polite-negative`) | 一緒に, 昼ごはん, どこ, 待つ, 持つ, 時間, いいですね, お願いします | 入口, 出口, 傘 and どこ (s01), それ and その (s02), 肉, 魚 and では (r09), 時間 (r07), and ba01's verbs and time words | 50 |

Each point drills its own contrast first, on the same four verbs. ba01's まとめ mixes all four endings, on 行く in a matching set, and moves them to する (勉強しました) and 来る in new venues; ba02's conversation drills and まとめ keep the four endings beside the new ones. Two later units retrieve them in their まとめ: r08 sets ません against ませんでした for a plan and puts an invitation among the other endings (now 50 items), and s06 asks for ませんでした, ます and an offer in ましょうか at the register (now 50 items). The catalog gains polite-nonpast, polite-past-negative, polite-negative and offer-mashouka. Each is drilled in Making plans and in Restaurants or Shopping, and invite-masenka is now drilled in Restaurants too, so a re-test can change venue. pl02 still teaches ～ませんか and ～ましょう; for a learner on the general sequence it is now a second meeting with them.

## The Learn path

The Learn path is one recommended order through the playable lessons. Since loop 2b (2026-10-22) it is one sequence, path version 2: every lesson is core, and there are no electives. Optional content is optional practices in Practice, never lessons ([Electives](#electives) records the history). Topic panels put playable lessons in teaching order, grouped by stage, with unwritten titles folded under Planned lessons; a title that a practice has is not listed there. The path decides which are open: a lesson unlocks in place once its `requires` are finished and no due checkpoint stands in front of it; until then its row says what opens it. The data is `path` in [curriculum.json](../curriculum.json), authored in `tools/seed-curriculum.mjs`. The rules it must satisfy are in [data-contract.md](data-contract.md#learn-path). Only playable lessons can be placed; outline titles stay in the catalogue. `learn.mjs` derives hidden, outline and open stones from these lessons. Topic arrows and swipes visit open stones only. Locked topic/lesson URLs replace themselves with Learn or the open topic before rendering. See [the garden entry map](learning-loop.md#stones).

### Audit of the playable units (2026-10-21)

Each unit was checked for what its points, drills, examples and conversation assume: words, frames and patterns that another unit's Words table or points teach, plus the "Reuses" note at the top of each unit file. An English feedback line that names a word for contrast is not counted as a prerequisite.

**No whole venue can be optional.** Shopping reuses restaurant material: s02 and s04 build orders with では (r09) and two-item counters (r03), s05 expects カード (r04) and recognizes 何名様 (r01), and s06 reuses card payment and 現金のみ (r04) and では (r09). Meeting people reuses の between nouns (r02), dishes and drinks (r03) and 昨日, 友達, 店 and おいしかった (r08). Making plans reuses 大丈夫 (s05), 入口 (s01) and 混んでいます (r08). Inside Restaurants, r09 turns to おすすめ (r06), r07 builds on 辛い and 得意 (r06), and r08's 辛かったです comes from r06.

**Broadly necessary (general):** requests, repair, numbers and prices (f01–f03); party size, menus, ordering two items, paying and restrictions (r01–r04); recommendations and something being unavailable (r06, r09), which also happen in shops; choosing with a reason and the polite past (r07, r08); finding and pointing at items, prices, checkout questions and payment (s01, s02, s04–s06); Bridge A (ba01, ba02); all six Meeting people units; and the three Making plans units.

**Topic enrichment (optional; practices since loop 2b):** r05, changing a dish (［N］抜きに できますか), which only restaurant lessons use; s03, sizes and colors, which clothes shopping needs and no later unit assumes; and Dating and relationships (d01–d04), which no general lesson assumes.

### The general sequence

The opening is **Basic sentences → Restaurants**: f01, f02 and f03, then r01. Starting f03 reveals only the Restaurants outline; finishing it opens that stone. Starting r01 reveals Meeting people and Shopping as outlines, and finishing it opens their entry lessons alongside r02. These entry prerequisites set the opening order; later prerequisites follow the language each unit reuses. Venues then alternate, as Arc 1 asks, so requests, prices and counters are tested in more than one place from the first weeks. Each lesson lists its direct prerequisites; earlier lessons are implied.

Checkpoint 1 still covers the same five lessons; swapping r01 and i01 puts its boundary after i01. Existing runs retain their questions, answers and completion when their boundary label is updated. Later checkpoint blocks are unchanged. Inserting h01 after s01 (card 0039, 2026-10-23) moves every later boundary one lesson earlier: with the lessons of 23 October the boundaries are i01, h01, s02, ba02, i06 and pl04, the sixth new because the path passed 30 lessons, so pl02, pl03 and pl04 now ship checkpoint recipes. Saved runs for checkpoints 2–5 keep their questions, answers and completion with the boundary label updated, since only inserted lessons moved their blocks ([data-contract.md](data-contract.md#checkpoints)); h01 and bb01, never asked there, join the next unfinished checkpoint (owner decision 0043). Inserting bb02 after bb01 (card 0041B) moves the sixth boundary from pl04 to pl03 in the same way: a finished sixth checkpoint keeps its run, and bb02 joins the next unfinished one. Inserting bc02 after bc01 (card 0042B) brings the path to 36 lessons, so a seventh checkpoint follows tr01 and covers pl04, pl05, bc01, bc02 and tr01: pl05's and bc01's held-back recipes ship, and bc02 and tr01 get new ones (assets-source/content-drafts/0042B.md); tr02 is in the trailing block. Inserting pl06 after pl05 (card 0038B) puts it inside the seventh block, which now covers pl04, pl05, pl06, bc01 and bc02 and ends after bc02; tr01 joins tr02 in the trailing block. A seventh checkpoint finished or started on the 36-lesson path keeps its run with the boundary label updated (an unfinished one waits for pl06, then resumes), and pl06, never asked there, waits for the next checkpoint. tr01's recipes stay shipped, so a saved run that asked them keeps its items; until an eighth checkpoint takes tr01 in, the validator warns that they are never asked. Appending bc03 after tr02 (card 0050) adds it to that trailing block and moves no boundary; its two recipes stay in its draft until a checkpoint takes it in. Inserting h02 after i03 (card 0048) puts it inside the third block and moves boundaries 3–7 one lesson earlier: with 39 lessons they are i01, h01, r09, ba01, s06, pl02 and bc01, and bc02 joins tr01, tr02 and bc03 in the trailing block. Finished and started runs for checkpoints 3–7 keep their questions, answers and completion with the boundary label updated, and h02, never asked there, joins the next unfinished checkpoint (`tests/checkpoints.test.mjs`). bc02's three recipes stay shipped, so a saved run that asked them keeps its items; until an eighth checkpoint takes bc02 in, the validator warns that they are never asked. Appending tr03 after bc03 (card 0049) brings the path to 40 lessons and closes an eighth checkpoint after tr03, covering bc02, tr01, tr02, bc03 and tr03 with 13 recipes: tr02's three and bc03's two held-back recipes ship unchanged, tr03 ships three, and bc02's and tr01's are asked at last. No earlier boundary moves. The content and later branch placements remain drafts; only the opening route is confirmed here.

| # | Lesson | Requires | Why it comes here |
|---|---|---|---|
| 1 | f01 Ask for something | — | The request and ありますか frames every later unit uses |
| 2 | f02 Ask someone to repeat | f01 | Repair builds on お願いします |
| 3 | f03 Numbers, prices, and quantities | f01, f02 | Counters go inside the request frame; numbers are confirmed with ですね |
| 4 | r01 A table for two | f02, f03 | The first venue after Basic sentences; the people counter is taught against the thing counters |
| 5 | i01 Greetings in context | f02, r01 | Branches after the first restaurant lesson; reuses お願いします, もう一度 and ゆっくり from the foundations |
| 6 | r02 Ask for the menu | f01, f02, f03, r01 | Seating comes before the menu; check-then-ask with ありますか, わかりました and counters |
| 7 | i02 Names and how to address people | i01 | Greetings and はじめまして |
| 8 | r03 Build an order | r01, r02 | Seating and the menu come first; と joins two counted items |
| 9 | s01 Looking for an item | f01, f02, r01 | Branches after the first restaurant lesson; transfers ありますか and ですね to finding an item |
| 10 | h01 There is a table | s01 | Builds on s01’s ［N］は［place］にあります, の近く and どこですか; introduces what is in a room with ［place］に［N］があります, against furniture and containers |
| 11 | r04 Can I pay by card? | r03 | The bill ends the visit; のみ and だけ restrictions |
| 12 | i03 Where you live and where you are from | i02, r02 | さん and greetings (i02); の between two nouns (r02) |
| 13 | h02 Where is everyone? | h01, i03 | h01’s ［place］に［N］が and ［N］は［place］に frames, now for people and pets with います; names with さん (i02) and 今 (i03) |
| 14 | r06 Which would you recommend? | r03, r04 | Dishes (r03), the bill and のみ (r04) |
| 15 | r09 Something is sold out | r04, r06 | Pivots with では to a check or a recommendation request (r06) |
| 16 | s02 This one or that one? | s01, r03, r09 | The shop setting (s01), counted orders (r03), では (r09) |
| 17 | r07 Explain your preference | r06, r09 | 辛い, 得意 and おすすめ (r06); では (r09) |
| 18 | i04 Work, study, and daily life | i03 | Builds on から来ました and に住んでいます |
| 19 | s04 How many and how much | s02, f03 | この／その／あの (s02); prices and counters (f03) |
| 20 | ba01 Do, don’t, did, didn’t | f02, i04, r07 | わかりました and もう一度 (f02); 会社, 大学 and パン屋 (i04); きょう and あまり (r06, r07) |
| 21 | ba02 Let’s, shall we, won’t you? | ba01, s02, r09 | The four endings (ba01); それ and その (s02); 肉, 魚 and では (r09) |
| 22 | r08 Tell a food story | r07, ba01, ba02 | おいしい and 今日 (r07); 辛かった from r06; its まとめ retrieves the Bridge A endings and an invitation (ba01, ba02) |
| 23 | s05 Bags, receipts, and points | s04, r01, r04 | お預かりします (s04), 何名様 (r01), カード (r04) |
| 24 | i05 Find a point in common | i04, r03 | Hands the question back (i04); dishes and drinks (r03) |
| 25 | s06 Payment and change | s05, r04, r09, ba01, ba02 | Totals and checkout (s04, s05), card and 現金のみ (r04), では (r09); its まとめ retrieves the Bridge A endings and an offer (ba01, ba02) |
| 26 | i06 Ask a natural follow-up | i05, r08 | Follows up on i03–i05 answers; 昨日, 友達 and 店 (r08) |
| 27 | bb01 Describe what is and isn’t | i06, s04, r08 | 静か and にぎやか, recognition in i06, become active; この／あの and sizes (s04); でも and food descriptions (r08) |
| 28 | bb02 Describe yesterday and now | bb01 | The same eight adjectives and their present forms (bb01); おいしかったです and きのうの［N］ (r08) |
| 29 | pl01 When are you free? | f02, s05 | ですね (f02); 大丈夫 (s05) |
| 30 | pl02 Invite someone | pl01, i06, bb01, bb02 | Days and times (pl01); いいですね (i04, i06); its まとめ retrieves よくないです (bb01) and よくなかったです (bb02) |
| 31 | pl03 Decide where to meet | pl02, s01, r08 | ませんか and ましょう (pl02); 入口 (s01); 混んでいます (r08); 駅 (i03, earlier) |
| 32 | pl04 Running late | pl03, ba01, ba02 | The meeting place with で and the plan it changes (pl03); ます against ました and the four endings (ba01); ませんか and ましょうか (ba02) |
| 33 | pl05 Dates and durations | pl04 | Clock times with から (pl01); minutes and ぐらい (pl04) |
| 34 | pl06 Read a simple schedule | pl05 | から, まで and 休み (pl01); 午前, 午後 and numbered 時間 (pl05); 映画館 (pl04) |
| 35 | bc01 Please wait a moment | pl04 | The verbs it forms: 食べる, 飲む and 行く (ba01), 待つ (ba02), 見る (pl02), 会う (pl03), 入る (pl04) and 来る (i03); after pl06 so that Changing plans stays together on the topic page |
| 36 | bc02 First this, then that | bc01 | The て-forms of 食べる, 飲む, 行く and 書く (bc01), whose chain also holds ます and ました (ba01), 待つ (ba02) and 会う (pl03); 買う and 帰る are taught here |
| 37 | tr01 Which platform? | pl04, pl03, s01 | 電車 (pl04); 駅 and ［place］に行きます (pl03); どこですか (s01); pl03 and s01 are pl04's ancestors, listed because tr01 retrieves them directly |
| 38 | tr02 Does this train stop there? | tr01 | 行き, バス, 電車, 駅 and この (tr01); its chain holds ［place］に行きます and ません (ba01) |
| 39 | bc03 May I use this? | bc01 | The て-forms of 書く, 待つ and 入る and ［て-form］ください (bc01), whose chain also holds ちょっと… (pl01) and 使う (r04); appended after tr02 so that no checkpoint block moves |
| 40 | tr03 Follow a short walking route | tr02, bc02 | 次 (tr02), whose chain holds 駅, この and どこ (tr01); ～てください and the う-verb て-form (bc01) and ～て、～ for two actions (bc02); appended after bc03, which it does not require, so it closes the eighth checkpoint and moves no earlier boundary |

### Electives

History. Path version 1 had electives: optional topic groups, each inserted after one general lesson (its anchor), which a learner would switch on. No page ever offered the choice. The owner decided on 22 October 2026 that there are no optional lessons ([learning-loop.md](learning-loop.md#optional-content)), and loop 2b turned the three electives into optional practices the same day. Saved progress in them was migrated ([data-contract.md](data-contract.md#state)): a finished lesson became a finished practice, and its answers moved with it.

| Elective (path version 1) | Anchor | Lessons | Now |
|---|---|---|---|
| `food-changes` Changing a dish | r04 | r05 | `without-onions` under r03, requires r03 |
| `sizes-colors` Sizes and colors | s02 | s03 | `sizes-colors` under s02, requires s02 and r09 |
| `dating` Dating and relationships | pl03 | d01–d04 | `dating-interests`, `dating-ask`, `dating-confirm` and `dating-feelings` under pl02 ([Dating and relationships](#dating-and-relationships)) |

They are optional because no lesson relies on their words or frames (`tests/progression.test.mjs` checks that no lesson drills a kanji word only an optional practice teaches), and the validator checks that no general practice or book depends on them.

### Teaching repairs for the general sequence

- **s01** now lists 卵 (egg) in its Words table and match drill. Its drills ask where the eggs are, and until then only r05, now an optional practice, taught the word.
- **r06**, drill H3, no longer expects 肉抜きにできますか, r05's pattern. It now asks the learner to say a dish is not their thing with r06's own あまり得意ではありません.

### For educator review

- The order and rationale above come from an audit of words, frames and patterns. Pacing and practical progression still need an educator's review.
- Katakana loanwords such as シャツ (s04) and カフェ (i04) appear before the unit that lists them; katakana is assumed.
- The 24 October trim reduced the existing lessons; tr03 was added afterward. Use the [current pacing table](content-inventory.md#lesson-sequence-and-companions) for each lesson’s count and the [dated repetition audit](lesson-audit.md) for before/after history.
- Card 0045 reworded early items in i01–i05, r04, r07, r08 and s04–s06 so that each tests only what a Point or Words row has taught by then (わたしも waits for i05-p1, お持ちですか for s05-p2). A fluent reviewer should check はい、持っています／いいえ、持っていません as replies to a cashier's ［N］はお持ちですか, おつりは三百六十円ですね (not ですよね) when the change is short, and うどんにします as a choice read off a menu.
- Bridge A (ba01, ba02) is new draft Japanese. A fluent reviewer should check its naturalness, whether any ましょう／ましょうか or ませんか／ません distractor is also acceptable in its situation, and whether two bridge units straight before r08 pace well. Tap results there show recognition and controlled building only; they do not show that the endings are used in speech.
- pl04 and pp03 are new draft Japanese. A fluent reviewer should check that the apology and the proposal sound natural on the phone and in a message (すみません、二十分ぐらい遅れます; 映画館の入口で会いませんか; 八時四十分のバスでは行きません), that times stay consistent (6:30 plus twenty minutes is 6:50; a train twenty minutes late misses the 8:40 bus), that no distractor is also acceptable (バスが遅れました on the phone was kept out of the word bank for that reason), and that split readings such as 二十分 (にじゅっ + ぷん) read well at 390px, where the reading can be wider than the kanji.
- tr01, `platform-and-bus` and pt01 are new draft Japanese. A fluent reviewer should check ［place］行き against ［place］行きの［vehicle］ in announcements and signs, the platform question あおば行きは何番線ですか, the readings よんばんせん and いき (ゆき is also correct and never marked wrong), and that のりば is read as a numbered stand, not a roadside bus stop (バス停).
- tr02, `stops-and-destinations` and pt02 are new draft Japanese. A fluent reviewer should check ［place］に止まりますか against ［place］に行きますか where they are set side by side, さくらには止まりません for a denied stop, 次は［station］です as a display line, ［place］で降ります with the rider left unsaid, and that 急行 and 普通 read as service labels only (普通 in its transport sense; the drills never infer a stop pattern from a label).
- pl06, `hours-and-events` and pp09 are new draft Japanese. A fluent reviewer should check 営業時間 and 定休日 as sign labels read beside Arabic clock ranges, ［event］は［time］に始まります／終わります for a film or a study session (勉強 alone as "the study session"), 映画館は午後六時までですね as a check on a sign, that no visit option is also defensible (a visit may end at closing time but not start there), and that the two checkpoint recipes (pl06-X1, pl06-X2) are natural in a university study room and a bakery.
- bc03, `permission-in-company` and pbc03 are new draft Japanese. A fluent reviewer should check ～てもいいですか against ～てください where they are set side by side, that いいですよ reads as a grant only in reply to a permission question, that すみません、ちょっと… reads as a refusal there and not as ちょっと待ってください, that はい、入ってください works as a grant of entry, and that the shipped checkpoint recipes (bc03-X1, bc03-X2) are natural at a station entrance and an office door.
- tr03, `walking-landmarks` and pt03 are new draft Japanese. A fluent reviewer should check ［corner／light］を［右／左］に曲がってください beside しんごうで右に曲がってください (never marked wrong), ひとつめの／ふたつめのかど for the first and second corner, ［place］の隣です for two buildings side by side, まっすぐ行って、… as a spoken route, はしをわたって, that every text map states a start and a facing so right and left have one answer, and that its checkpoint recipes (tr03-X1–X3) and the activated tr02-X1–X3 and bc03-X1–X2 are natural in their venues.
- bc02, `housemate-sequence` and pbc02 are new draft Japanese. A fluent reviewer should check that ～て and ～てから read naturally for the same planned pairs (パンを買って、帰ります; お茶を飲んでから、たなかさんと会います), that no item marks a grammatical plain て sequence wrong or implies an exact gap after てから, that 帰ります alone reads as going home, and that the five checkpoint recipes added with it (bc02-X1–X3, tr01-X1–X2) are natural in their venues with one defensible answer.
- bc01, `counter-requests` and pbc01 are new draft Japanese. A fluent reviewer should check the register of each direct ～てください request (agreed jobs between helpers, an assistant to a customer, an offer to a guest), ちょっと待ってください for a brief wait, ［person］を呼んでください against ［name］と呼んでください, and 来て against 行って when the speaker is or is not at the place.
- bb02, `yesterday-and-now` and pbb02 are new draft Japanese. A fluent reviewer should check that きのうの［N］ reads naturally for the room, shop or café seen that day, that よかったです and よくなかったです evaluate a particular visit rather than the place for good, that the English change reasons (a group arrives, a cleaner finishes, a new batch of curry) make each present form fair, and that the book's message sounds like an update sent from the café's room.
- bb01, `describe-everyday` and pbb01 are new draft Japanese. A fluent reviewer should check that いいです evaluates a particular thing (この［N］はいいです) without sounding like declining, the clean sense of きれい in room checks, じゃないです as the taught polite negative beside the recognized ではありません, and the voice message's この部屋／あの部屋 from inside one room.
- h02, `people-and-pets` and ph02 are new draft Japanese. A fluent reviewer should check います against あります where the drills set them side by side, that ［place］にいますか and どこにいますか sound natural about a housemate or a pet, that 今、いません reads as "not here now" and gives no other place, that no distractor or order extra is also acceptable, that ねこ in kana reads naturally, and that the message-board note sounds like one left in a shared home. Its four checkpoint recipes (h02-X1–X4) and six check sentences for 犬 and 外 are new draft Japanese too.
- h01, `home-other-room` and ph01 are new draft Japanese. A fluent reviewer should check ［place］に［N］があります against ［N］は［place］にあります where the drills set them side by side, that 上 reads as on the surface (いすの上, the seat) as well as above, that no particle distractor or order extra is also acceptable, that いす and かぎ in kana read naturally, and that Ken's note sounds like a note left for a housemate. The six pl02–pl04 checkpoint recipes and the eight check sentences for 部屋, 箱, 下 and 中 added with it are new draft Japanese too.
- Dating and relationships (the four optional practices, once d01–d04, and pd01, pd02) is new draft Japanese. A fluent reviewer should check that the relationship language is natural and its politeness fits adults getting to know each other (デートしませんか, ふたりで, うれしいです。でも…, 付き合ってください, はい、よろしくお願いします, 友達でいたいです); that no choice has a second defensible answer, especially where うれしいです alone or いいですね could be heard as a yes; and that every feedback line respects an explicit no and never treats politeness or silence as agreement. Tap results there show recognition and controlled building, not conversational fluency; delayed retention of the two threads still needs a learner pilot.
- A lesson never relies on a practice ([learning-loop.md](learning-loop.md#what-each-kind-is-for), decision 1), and since 23 October 2026 no lesson's drill uses a word that only practices or books teach ([rule 6](learning-loop.md#rules)); the validator checks it. This closed the lesson-side step the Phase 4 plan had left undone: 21 lessons drilled 39 such words, among them そば (r06, r07, r08, r09, ba01, ba02, i05 and pl04), the days of the week and 午後 (i05 and pl01–pl03) and 入って (pl04).
  - Most words joined the Words table of the lesson that drills them, or of an earlier lesson already in its chain: そば joined r03, which is in the chain of every lesson that drills it; 土曜日, 日曜日, 朝 and 夜 joined i05, and so reach pl02–pl04; 金曜日 and ［N］のあとで joined pl02, 休み pl01, and 入って joined pl04 as a recognized word, as in 先に入ってください. No `path.requires` changed.
  - Where a Words table was full, the item was reworded within taught words: pl01's drills keep to 月曜日, 火曜日 and 木曜日; pl02 and pl03 drill 木曜日 instead of 水曜日; 午後 became 夜 in pl02 and 朝 in i05; i05 drills ヨガ and カレー instead of テニス and 紅茶. These rewordings are new draft Japanese for the same fluent review.
  - The conversations and some solved examples still show such words with their English, as display: pl01–pl03's conversations show 水曜日, and pl01's examples 土曜日 and 午後.

## Session and week shapes

A 25-minute session, testing first:

1. **Retrieve (5 min):** due passage recall on a book's page in Library → Reading, drawing on earlier learning (the optional lesson reviews in Practice were removed on 2026-10-29 at the owner's direction; reviews stay parked).
2. **Learn (15–17 min):** one lesson, or the next part of one: the words and their drill, each point followed at once by its drills, the conversation and its drills, and the まとめ review. A lesson usually has 35–50 distinct checks (roughly 15–20 minutes); repeated retrieval continues in Practice. On passage and conversation days, this slot holds a read-retain-test passage or a conversation scenario instead.
3. **Check and reflect (3–5 min):** one item from today asked again without the model, and a note of what you couldn't yet say.

Split a longer lesson across sessions without losing its place.

A flexible five-session week can include two new-learning sessions, one read-retain-test passage, one conversation scenario, and one delayed transfer/review session. This is a suggested rhythm rather than a calendar deadline. If retrieval or conversation remains difficult, consolidate before expanding vocabulary.

## Gaps to design next

The grammar bridges A–F are now placed in the sequence. Bridge A has two draft units (ba01, ba02); B–F each still need a full bridge lesson set: canonical explanation, contrasts, and links to the venue lessons that depend on it. Also still to design: node briefs for the four candidate nodes; and interest-specific media and professional vocabulary chosen with the learner's input. Cultural practices must be described as context-dependent, with alternatives and exceptions.

## Sources consulted

- [Japan Foundation Standard](https://www.jfstandard.jpf.go.jp/summaryen/ja/render.do) — can-do task organization.
- [Irodori: Japanese for Life in Japan](https://www.irodori.jpf.go.jp/en/about.html) — range of everyday-life topics across Starter to Pre-intermediate (introductions, food, transport, hospital, local events, disaster preparation, work). Used as a coverage cross-check; no content is reproduced.
- [Roediger & Karpicke (2006)](https://pubmed.ncbi.nlm.nih.gov/16507066/) — testing after reading prose produced better one-week retention than re-reading.
- [Cepeda et al. (2008)](https://pubmed.ncbi.nlm.nih.gov/19076480/) — the best review gap grows with the retention interval: about 20% of the delay for retention over a few weeks, falling to about 5–10% for a year.
- [Carpenter & Toftness (2017)](https://www.learningscientists.org/blog/2017/11/2-1) — prequestions before a short video lesson improved learning, including learning of material that was not prequestioned. The passage prequestion based on it was retired on 2026-10-21 for a Focus line that names what to attend to without asking for a guess.
- [Hu & Nation (2000)](https://aila2021.dryfta.com/program/abstract-archive/abstract/public/416/unknown-vocabulary-density-reading-comprehension-and-the-98-coverage-figure-replicating-hu-nation-2000) — known-word coverage and reading comprehension.
- [Jōyō kanji](https://en.wikipedia.org/wiki/J%C5%8Dy%C5%8D_kanji) — the 2010 list of 2,136 characters as the scale reference.

Niwa's levels, arcs, thresholds, and sequence are original design proposals with no official CEFR or JLPT equivalence.

### 25 October early transport and review update

tr00, Read a station sign, now sits at position 10 immediately after s01 and requires s01/f03. It introduces location, direction arrows and numbered exits; tr01–tr03 retain later destinations, stops and sequenced directions. Eight explicit checkpoint anchors preserve earlier boundaries, with six lessons in block 2 and five in every other block. The immediate r03/s04/i05 loops are described in the [audit](curriculum-audit.md); the optional Practice/Reading delayed review it also describes was removed on 2026-10-29 at the owner's direction, and reviews stay parked.
