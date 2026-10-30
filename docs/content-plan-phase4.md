# Learning loop Phase 4: content plan

Working plan for Phase 4 of the [learning loop](learning-loop.md) build. Phase 4 gives every lesson at least one general practice and one general book, and fits the existing books to their home lessons.

- **Status:** done on 23 October 2026, the day it was drafted. The coordinator drew it up under the owner's go-ahead to finish the build without further sign-off, so every part is open to the owner's changes. [What shipped](#7-what-shipped-23-october-2026) records the result against this plan; sections 1–6 are the plan as written.
- **Format:** content follows the [content standard](content-standard.md) and the data contract's "Learning loop" section.
- **Kanji words:** follow the data contract's "Kanji words drill (Phase 3 unit format)", from the kanji session's Phase 3:
  - a practice introduces 1–2 kanji words, and a book at most one;
  - no kanji-parts drills;
  - no word that a core lesson already introduces.
- **When it starts:** Phase 4 starts only after the kanji session's Phase 3 lands.

## Starting point (validator, 23 October 2026)

- 26 lessons lack a general practice. Only r03 (*Everyday dishes*) and r04 (*Restaurant review*) have one.
- 20 lessons lack a general book: f01–f03, r01–r04, r06, r07, r09, s01, s02, i01–i04, ba01, ba02, pl01 and pl02.
- 11 of the 12 passages introduce more than 5% of their word occurrences.

**The 5% arithmetic.** The cap (rule 6) counts tagged word occurrences:
- A book with fewer than 20 occurrences can introduce no word at all.
- Two introduced occurrences need at least 40.

So a new book introduces 0–1 words, and the existing books move nearly all their introduced words into general practices in their chains.

## 1. Practice size (decided)

A general practice has **20–30 counted items**, which takes about 10–13 minutes and shows as *Medium*.
- It has three parts: a bulk-words drill (8–10 items), one or two points with enough varied retrieval to support the Practice objective (the lesson drill quota was retired on 2026-10-24), and a short まとめ (4–6 items).
- That gives each new word about five retrievals at about half a lesson's length.
- The two existing general practices (4 and 3 items) are topped up to this range in batch 2.
- Optional practices converted from lessons keep their 47–50 items.

## 2. One general practice per lesson (26)

Format key:

| Code | Format |
|---|---|
| M | matching |
| C | multiple choice |
| KW | kanji words drill |
| B | fill the gap |
| S | sorting |
| O | tiles in order |
| ★ | ★ ordering |
| R | realia choice (menu, sign, flyer, schedule) |
| W | word-bank dialogue |
| まとめ | mixed review |

All are general (not optional) and tap or drag only. Their items use venues and partners that the home lesson does not. "Reuse" marks an existing vocabulary ID.

| Home | ID, title | `requires` | Expansion | Points | Bulk new words (≈) | Formats | Items |
|---|---|---|---|---|---|---|---|
| f01 Ask for something | `counter-drinks`, *Hot or iced? At the counter* | `lesson:f01` | vocabulary; context: café, kiosk, convenience store, hotel desk | ［ホット・アイス］［drink］をください | ≈10: hot, iced, black tea, cake, sandwich, spoon, wet towel, sugar, milk (reuse), straw | M, C, KW, B, O, R, まとめ | 22 |
| f02 Ask someone to repeat | `another-way`, *In English, or written down* | `lesson:f02` | changed wording (もう一回/もう一度); ですか vs ですね; station window, hotel desk | ［英語・日本語］でお願いします, 書いてください as a chunk; ですか vs ですね | ≈8 | M, S, B, O, C, まとめ | 24 |
| f03 Numbers, prices, and quantities | `count-to-ten`, *Four to ten, and prices over 1,000* | `lesson:f03` | vocabulary in bulk; bakery, festival stall, kiosk | いくつですか with よっつ…とお; 千 and its sound changes | ≈10 | M, C, O, R, まとめ | 26 |
| r01 A table for two | `seats-and-bookings`, *Counter, table or window seat* | `lesson:r01` | vocabulary; walk-in or booked; staff variants recognized | answering ご予約は…?; ［seat］をお願いします / はありますか | ≈9, including reservation, seat, window (reuse) | M, C, KW (予約), B, O, C, まとめ | 24 |
| i01 Greetings in context | `greet-casually`, *Greetings at work and with friends* | `lesson:i01` | casual forms as chunks; work, neighbour, friends | おはようございます vs おはよう; leaving: じゃあ、また / お先に失礼します / お疲れさまです | ≈9 | S, M, B, C, まとめ | 24 |
| r02 Ask for the menu | `menu-card`, *Lunch sets, courses and refills* | `lesson:r02` | menu vocabulary; realia | ［N］のおかわりをお願いします; おかわり自由 recognized | ≈10, including course (reuse) | M, R, B, O, まとめ | 22 |
| i02 Names and how to address people | `titles-and-names`, *Other titles: 先生, ちゃん, 様* | `lesson:i02` | school, children, letters, staff; politeness | which title; family or given name, ［name］と呼んでください as a chunk | ≈8 | S, M, C, R, O, まとめ | 24 |
| s01 Looking for an item | `shelf-and-floor`, *Upstairs, on the left, next to the eggs* | `lesson:s01` | position words and floors; department store, station, drugstore | ［place］の［上・下・右・左・隣］にあります; ［n］階, 地下 | ≈11 | M, S, B, O, R, まとめ | 28 |
| i03 Where you live and where you are from | `my-hometown`, *From where, and what it's like* | `lesson:i03` | changed wording; detail; vocabulary | 出身です vs から来ました; ［い-adj］町 / ［な-adj］な町 | ≈9 | M, C, B, S, O, まとめ | 24 |
| r06 Which would you recommend? | `taste-and-ingredients`, *Sweet, salty, and what's in it* | `lesson:r06`, `practice:everyday-dishes` | taste vocabulary; い-adjective negative; ingredients as preference, never allergy | ［N］が入っていますか (chunk); あまり［adj］くないです | ≈10 | M, C, B, S, O, R, まとめ | 28 |
| r09 Something is sold out | `sold-out-ways`, *Other ways to say it's gone* | `lesson:r09` | changed wording (もうありません, 終わりました, 売り切れ, 品切れ) | recognizing the variants; じゃあ［N］にします / でいいです | ≈8 | S, M, C, O, R, まとめ | 24 |
| s02 This one or that one? | `bakery-which-one`, *Which one? どれ and どの* | `lesson:s02` | question words vs pointing words; deli, souvenirs | どれですか / どの［N］ですか → これです / この［N］です | ≈10 | M, B, O, C, まとめ | 22 |
| r07 Explain your preference | `choosing-where-to-eat`, *Soba or a restaurant? Choosing with friends* | `lesson:r07` | casual chunks; places to eat; reasons | どっちがいい? / ［N］がいい vs polite; reasons with から | ≈12 | M, S, B, O, C, まとめ | 28 |
| i04 Work, study, and daily life | `my-week`, *Your week: days, mornings and afternoons* (**hub**: 8 books need it) | `lesson:i04` | days, a.m./p.m., days off; job, study, part-time | ［day］の午前・午後; ［day］は休みです / 仕事です | ≈14 | M×2, KW (土曜日), S, B, O, R, まとめ | 30 |
| s04 How many and how much | `packs-and-sales`, *Packs, sizes and sale prices* | `lesson:s04` | grocery shelves; packaging, not clothes | ［n］個 / パック; 大きい / 小さい［N］ | ≈10 | M, R, B, O, まとめ | 26 |
| ba01 Do, don't, did, didn't | `everyday-verbs`, *Get up, buy, read: more everyday verbs* | `lesson:ba01` | verbs in bulk; how often | よく / ときどき / あまり～ません; ［place］で［N］を［V］ます | ≈12 | M×2, S, B, O, C, まとめ | 30 |
| ba02 Let's, shall we, won't you? | `offers-and-replies`, *Shall I open the window?* | `lesson:ba02` | natural replies; verbs for offers | answering ～ましょうか; ［N］を［V］ましょうか | ≈10 | M, S, B, O, C, まとめ | 26 |
| r08 Tell a food story | `telling-it-well`, *Who said what: a meal in more detail* | `lesson:r08`, `practice:everyday-verbs` | quoting; な-adjective past; feelings | 「…」と言いました / ［person］に聞きました; 楽しかった / 残念でした / びっくりしました | ≈10 | M, C, B, O, S, C, まとめ | 28 |
| s05 Bags, receipts, and points | `register-extras`, *Heat it up? More questions at the register* | `lesson:s05` | bento, self-checkout, drugstore; staff keigo recognized | お弁当、温めますか / 袋、分けますか; ～でよろしいですか recognized | ≈10 | M, S, B, O, C, まとめ | 24 |
| i05 Find a point in common | `free-time`, *Weekends and free time* | `lesson:i05`, `practice:everyday-verbs` | pastimes; も/は with verbs | ［N］も［N］も好きです; 週末は［V］ます → わたしもです / わたしは［V］ません | ≈10 | M, S, B, O, C, まとめ | 26 |
| s06 Payment and change | `paying-other-ways`, *Phone, IC card or cash* | `lesson:s06` | payment methods; bigger amounts | ［method］でお願いします / 払えますか; 万, 千円札 | ≈9 | M, R, B, O, まとめ | 24 |
| i06 Ask a natural follow-up | `keep-in-touch`, *Email, phone, and 教えてください* (**hub**: 7 books need it) | `lesson:i06` | contact words; chunk wording | ［N］を教えてください (chunk); メールで / 電話で連絡します | ≈9 | M, KW (電話), B, O, C, まとめ | 26 |
| pl01 When are you free? | `times-of-day`, *Morning, evening, and by when* | `lesson:pl01`, `practice:my-week` | まで vs までに; parts of the day | ［time］まで vs までに; 朝 / 昼 / 夜 + a time | ≈9 | M, S, B, O, R, まとめ | 26 |
| pl02 Invite someone | `kind-replies`, *ぜひ, or また今度* (non-romantic, unlike optional `dating-ask`) | `lesson:pl02` | natural replies; colleague, neighbour, club | yes: ぜひ / いいですね、［V］ましょう; a kind no: ［reason］から…また今度 | ≈9 | M, S, B, O, C, まとめ | 24 |
| pl03 Decide where to meet | `meeting-points`, *North exit, the clock, the bus stop* | `lesson:pl03`, `practice:shelf-and-floor` | station landmarks | 東口 / 西口 / 南口 / 北口の前で; ［landmark］の右 / 左 / 隣 | ≈10 | M, R, B, O, まとめ | 26 |
| pl04 Running late | `late-and-changes`, *Almost there: updates on the way* | `lesson:pl04` | 遅くなります vs 遅れます; progress messages | もうすぐ着きます / 今［place］です; 遅くなります, 先に［V］ください recognized | ≈9 | M, S, B, O, C, まとめ | 24 |

**Titles.** Never reuse a planned lesson's exact title, because the topic page hides a planned title that matches a practice. Watch especially *Making a reservation*, *What is in the dish?*, *Small, regular, or large?*, *Here, there, and which one*, *Dates and durations*, *Accept or suggest another time* and *Cancel and explain*.

## 3. One general book per lesson that lacks one (20)

**Rules for all 20**
- Before Bridge A, books use present-tense genres: a sign, a menu, a card or a short script.
- Each book requires its home lesson and that lesson's practice.
- Each book introduces 0–1 words, once.

| Home | ID, title | Genre | Remember | `requires` | Length (chars, ≈ occurrences) | Introduces |
|---|---|---|---|---|---|---|
| f01 | `pf01` *Two drinks, one missing* | café board + exchange | what the café has and doesn't; the order | `lesson:f01`, `practice:counter-drinks` | 60–90 (~20) | 0–1 |
| f02 | `pf02` *At the hotel desk* | script | which repair worked; what was checked | `lesson:f02`, `practice:another-way` | 60–100 (~20) | 0 |
| f03 | `pf03` *The onigiri stand board* | price board + exchange | prices, quantity, total | `lesson:f03`, `practice:count-to-ten` | 70–110 (~22) | 0–1 |
| r01 | `p04` *A party of three at the door* | sign + staff script | seating and why | `lesson:r01`, `practice:seats-and-bookings` | 100–140 (~25) | 0–1 |
| i01 | `pi03` *Three greetings in one day* | three scripts | which greeting went to whom | `lesson:i01`, `practice:greet-casually` | 120–150 (~28) | 0 |
| r02 | `p05` *The lunch menu card* | menu card + exchange | what the set includes, what costs extra | `lesson:r02`, `practice:menu-card` | 100–150 (~25) | 0–1 |
| i02 | `pi04` *The volunteer rota* | rota notice | whom to ask for, titles, how your name is written | `lesson:i02`, `practice:titles-and-names` | 120–160 (~28) | 0–1 |
| r03 | `p06` *An order for the table* | order slip + read-back | quantities per dish, drinks, one change | `lesson:r03`, `practice:everyday-dishes` | 150–200 (~35) | 0–1 |
| s01 | `ps03` *The drugstore floor guide* | floor guide + exchange | where three items are | `lesson:s01`, `practice:shelf-and-floor` | 100–150 (~28) | 0–1 |
| r04 | `p07` *The sign by the register* | payment notice | which methods work; the limit | `lesson:r04`, `practice:restaurant-review`, `practice:count-to-ten` | 90–140 (~22) | 0–1 |
| i03 | `pi05` *Plot labels at the community garden* | self-introduction cards | who is from where, lives where | `lesson:i03`, `practice:my-hometown` | 120–160 (~30) | 0–1 |
| r06 | `p08` *The spice-level menu* | menu + exchange | choosing for a friend who avoids spicy food (preference only) | `lesson:r06`, `practice:taste-and-ingredients` | 150–200 (~35) | 0–1 |
| r09 | `p09` *Sold out by noon* | set-meal board + script | what's gone, what's left, who chose what | `lesson:r09`, `practice:sold-out-ways`, `practice:everyday-dishes` | 150–200 (~35) | 0–1 |
| s02 | `ps04` *Three breads behind the glass* | bakery script + labels | which bread, how many | `lesson:s02`, `practice:bakery-which-one` | 120–180 (~32) | 0–1 |
| r07 | `p10` *Soba or curry?* | friends' message thread | the choice and each reason | `lesson:r07`, `practice:choosing-where-to-eat` | 150–200 (~35) | 0–1 |
| i04 | `pi06` *Ito's week* | class-board post | when Ito works, studies, is free | `lesson:i04`, `practice:my-week` | 150–200 (~35) | 0–1 |
| ba01 | `pp04` *Mori's usual morning* | short polite diary | habits vs yesterday | `lesson:ba01`, `practice:everyday-verbs` | 150–200 (~38) | 0–1 |
| ba02 | `pp05` *Moving day at the office* | office group message | who offered what, what was declined, the plan | `lesson:ba02`, `practice:offers-and-replies` | 150–220 (~40) | 0–1 |
| pl01 | `pp06` *Ueno's free times* | schedule reply (a new partner, not Hayashi) | free times and the slot chosen | `lesson:pl01`, `practice:times-of-day` | 150–220 (~38) | 0–1 |
| pl02 | `pp07` *An invitation to the summer festival* | invitation thread | the final day and time, and the plan after | `lesson:pl02`, `practice:kind-replies` | 180–250 (~42) | 0–1 |

## 4. Fitting the existing passages

Each existing book keeps its story. Its introduced words are revised out or taught by a general practice in its chain.

| Book (home) | Now | Action | New `requires` |
|---|---|---|---|
| p01 (r08) | 17.9%, needs pl02 | Revise 小さい, 見て (the only pl02 word), and the ～ですが and ので clauses. Teach レストラン, そば → `choosing-where-to-eat`; 言う, 食事 → `telling-it-well`; 聞く → `everyday-verbs` | `lesson:r08`, `practice:choosing-where-to-eat`, `practice:telling-it-well` |
| p02 (r08 → **pl04**) | 58.8%, needs pl04 | Move the home to pl04, because the late-arrival rule needs 遅れる. Teach 予約, 席, 窓 → `seats-and-bookings`; コース → `menu-card`; 選ぶ, 違う → `choosing-where-to-eat`; 土曜日, 金曜日, 午後 → `my-week`; 連絡, 電話 → `keep-in-touch`. Revise できる (use 同じ) and 条件. Keigo only as glossed fixed phrases | `lesson:pl04` and those five practices |
| p03 (r08) | 31.1% | Teach 野菜, だし → `everyday-dishes`; 席 → `seats-and-bookings`; 入る, 材料 → `taste-and-ingredients`; 選ぶ → `choosing-where-to-eat`; 店員, 言う, 驚く → `telling-it-well`; 聞く → `everyday-verbs`. **Rewrite in です/ます** without the plain style, passive, くれた, つもり, かもしれない, わけではない or ながら. Trim to about 400 characters | `lesson:r08` and those practices |
| ps01 (s05) | 44.2%, needs ba02, i05, pl01 | 1パックまで → 1パックだけ. Teach セール, パック, 大きい, サイズ → `packs-and-sales`; 土曜日, 日曜日, 午後, 週末 → `my-week`; 野菜, 果物, 牛乳 → `everyday-dishes`; ポイント → `register-extras`; 買う, 買い物 → `everyday-verbs` | `lesson:s05` and those practices |
| ps02 (s06) | 30.3%, needs pl01 | Drop the non-critical "open until 10 p.m.". Revise 白, 黒 (a size or price preference instead, keeping the fallback idea unit). Teach パック, 大きい, 小さい → `packs-and-sales`; 買う, 買い物 → `everyday-verbs` | `lesson:s06`, `lesson:r08`, `practice:packs-and-sales`, `practice:everyday-verbs` |
| pi01 (i06) | 26.5% | Revise 店員 → パン屋で働いています. Teach 教える, メール → `keep-in-touch`; 水曜日, 午後 → `my-week` | `lesson:i06`, `practice:my-week`, `practice:keep-in-touch` |
| pi02 (i06) | 20.5% | Teach 教える, メール, 連絡 → `keep-in-touch`; 水曜日, 午後 → `my-week` | as pi01 |
| pp01 (pl03) | 10.7% | Teach 土曜日, 日曜日 → `my-week`; メール → `keep-in-touch` | `lesson:pl03`, `practice:my-week`, `practice:keep-in-touch` |
| pp02 (pl04) | 13.6% | Teach 連絡, 電話 → `keep-in-touch`; 土曜日 → `my-week` | `lesson:pl04`, `practice:my-week`, `practice:keep-in-touch` |
| pp03 (pl04) | 12.1% | Teach 電話 → `keep-in-touch`; 買う → `everyday-verbs` | `lesson:pl04`, `practice:keep-in-touch`, `practice:everyday-verbs` |
| pd01 (pl02, optional) | 9.1% | Teach 日曜日 → `my-week` | `lesson:pl03`, `practice:dating-ask`, `practice:my-week` |
| pd02 (pl02, optional) | 3.4% | Optional tidy-up: 土曜日 → `my-week` | adds `practice:my-week` |

**Knock-on effects**
- t01 opens after r08 instead of pl02, because p01 is one of its prerequisites.
- Lessons that show 水曜日, 金曜日, 土曜日, 日曜日 or そば in their dialogue without teaching them (pl01–pl03, r07, r08, i05) add those words to their Words tables in batch 7. Otherwise the check "a lesson shows a word taught only by a practice" fails.

## 5. Batches

Practices come before the books that require them, and everything follows path order. Each batch gets a separate Japanese review before it is committed.

| # | Topic | Contents |
|---|---|---|
| 1 | Basic sentences | `counter-drinks`, `another-way`, `count-to-ten`, then pf01–pf03 |
| 2 | Restaurants, a basic visit | `seats-and-bookings`, `menu-card`, then p04–p07; top up `restaurant-review` and `everyday-dishes` to 20–30 items |
| 3 | Meeting people, opening lessons | `greet-casually`, `titles-and-names`, `my-hometown`, `my-week`, then pi03–pi06 |
| 4 | Restaurants middle and Shopping | `taste-and-ingredients`, `sold-out-ways`, `choosing-where-to-eat`, `shelf-and-floor`, `bakery-which-one`, `packs-and-sales`, then p08–p10, ps03, ps04 |
| 5 | Bridge A, r08, checkout, follow-ups | `everyday-verbs` first, then `offers-and-replies`, `telling-it-well`, `register-extras`, `free-time`, `paying-other-ways`, `keep-in-touch`, then pp04, pp05 |
| 6 | Making plans | `times-of-day`, `kind-replies`, `meeting-points`, `late-and-changes`, then pp06, pp07 |
| 7 | Refit the existing books | section 4, ending with the p02 home move and the p03 rewrite |

**Totals:** about 660 practice items, about 250 new words and 20 new books. When batch 7 is done, the validator's 5% share, coverage and per-lesson minimum become failures instead of warnings.

## 6. Where a fluent reviewer is needed

- **Register**
  - Casual forms before Bridge D stay fixed chunks.
  - Staff keigo is for recognition only, and contested forms such as ～になります are avoided.
  - Titles (先生, ちゃん, くん, 様) are never stated as universal rules.
- **Counters and sound changes**
  - よっつ–とお, prices in 百 and 千 (さんびゃく, ろっぴゃく, はっぴゃく, さんぜん, はっせん), 個 (いっこ, ろっこ, はっこ, じゅっこ), 階 (いっかい, さんがい, なんがい).
  - ひとり vs ひとつ.
- **Particles**
  - に vs は with days, and まで vs までに.
  - Means で, which is not location で, and must match the `pay-method-de` pattern only if it is truly the same structure.
  - も vs は with verbs, が in 入っています, and quoting と.
- **Early grammar**
  - い-adjective negatives and な-adjective past come before Bridge B.
  - Te-form chunks come before Bridge C and are never derived.
  - Books introduce no grammar.
- **Collisions**
  - `kind-replies` stays non-romantic, apart from the optional Dating set.
  - `packs-and-sales` covers packaging, not clothes.
  - Ingredients are preferences only; allergy content needs expert review.
- **Kanji look-alikes:** 午前/午後, 木/本, 休/体, 右/石, 入口/人.

## 7. What shipped (23 October 2026)

All seven batches are integrated. Every lesson is the home of a general practice and a general book, and the validator enforces coverage, the 5% share and the per-lesson minimum with no loop problems or warnings ([learning-loop.md](learning-loop.md#prerequisite-map-existing-content)).

| Batch | Practices (counted items) | Books | niwa commit |
|---|---|---|---|
| 1 | `counter-drinks` 29, `another-way` 29, `count-to-ten` 28 | pf01–pf03 | 78f42fc |
| 2 | `seats-and-bookings` 29, `menu-card` 26; `restaurant-review` 27 and `everyday-dishes` 25 topped up | p04–p07 | 78f42fc |
| 3 | `greet-casually` 27, `titles-and-names` 28, `my-hometown` 27, `my-week` 30 | pi03–pi06 | 78f42fc |
| 4 | `taste-and-ingredients` 29, `sold-out-ways` 28, `choosing-where-to-eat` 29, `shelf-and-floor` 29, `bakery-which-one` 26, `packs-and-sales` 27 | p08–p10, ps03, ps04 | 6f4eba3 |
| 5 | `everyday-verbs` 30, `offers-and-replies` 28, `telling-it-well` 29, `register-extras` 26, `free-time` 28, `paying-other-ways` 25, `keep-in-touch` 25 | pp04, pp05 | faf752b |
| 6 | `times-of-day` 29, `kind-replies` 29, `meeting-points` 29, `late-and-changes` 29 | pp06, pp07 | faf752b |
| 7 | none | the 12 earlier books refitted | 90711ce |

**Totals.** 780 counted items across the 28 general practices (the plan estimated about 660), 20 new books, and vocabulary from 244 to 406 entries (the plan estimated about 250 new words). Kanji check sentences went from 252 to 359 (e7b6690, 480447d and the integrations), and look-alike pairs from 43 to 39.

**Deviations from the plan**
- **Practice size.** 25–30 counted items, above most estimates, because every practice gained a kanji words drill and a まとめ find item. All are inside 20–30.
- **Titles.** A practice title is plain text and cannot carry ruby markup, so four changed: `titles-and-names` *Other titles: for teachers, children and customers*, `keep-in-touch` *Email, phone and “please tell me”*, `paying-other-ways` *Phone, e-money or cash* (a vocabulary reading must be kana, so ICカード cannot be a word), and `kind-replies` *Yes, gladly, or maybe next time*.
- **`requires`.** `kind-replies` also requires `my-week`, for its days and 午後. In the refit, p02 dropped `choosing-where-to-eat` and added `times-of-day` (for までに), and pp01 added `times-of-day`, so t03 and t04 wait on it too.
- **p02.** It says the same-course rule with 同じ, a new word (`onaji`) and its one introduced word. The 15-minute threshold and the remaining keigo and formal vocabulary were cut.
- **p03.** Rewritten in です/ます at 457 characters, against about 400.
- **Vocabulary.** `condition`, `colleague`, `explain` and `tokoroga` were removed with their kanji check sentences and look-alike pairs: no text referenced them after the refit. までに is now the vocabulary word `madeni` (45f1301), not a transfer function word.
- **Lengths.** A few books run outside their planned lengths: pf01 96 characters (plan 60–90), pi03 169 (120–150) and pi04 115 (120–160).
- **Done after the batches.** Section 4's lesson-side knock-on was left undone when the batches shipped: r07, r08 and i05 showed そば, pl01–pl03 days of the week (水曜日, 金曜日, 土曜日, 日曜日) and, in pl01 and pl02, 午後, that only practices taught (`choosing-where-to-eat`, `my-week`), and pl04 showed 入って (`contain`), which only `taste-and-ingredients` taught. A check over every lesson found 39 such words in the drills of 21 lessons, and a later pass on 23 October 2026 closed the gap for drills ([learning-loop.md](learning-loop.md#rules), rule 6). Each word joined the Words table of the lesson that drills it or of an earlier lesson in its chain (そば r03; 土曜日, 日曜日, 朝 and 夜 i05; 金曜日 pl02), or the item was reworded within taught words where a table was full (pl01, pl02, pl03, i05). No `path.requires` changed. The validator now fails on a lesson drill that uses a word only practices or books teach; conversations and solved examples may still show one with its English ([curriculum.md](curriculum.md#for-educator-review)).

**Review records.** Each batch was drafted and reviewed in the workspace's `content-staging/phase4/` folder, outside niwa. `batch-N/NOTES.md` records the author's changes to the plan, and `batch-N/REVIEW.md` the Japanese review: 265 must-fix issues fixed in all (22, 27, 19, 71, 85, 30 and 11 for batches 1–7). Where the two differ, REVIEW.md is current. Every REVIEW.md has a *For a human educator* list of judgment calls the review left open, such as register, reading distractors, sound changes and recovery sentences that reach beyond a book's chain. No fluent human educator has reviewed this content yet ([roadmap.md](roadmap.md)).
