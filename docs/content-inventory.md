# Current content inventory

Generated from the app's local content. This is the reference for current counts, sequence, companions and prerequisites. The [curriculum audit](curriculum-audit.md) records editorial findings and proposed additions separately. Regenerate with `node tools/content-inventory.mjs --write`; verify with `node tools/content-inventory.mjs --check` or `node tools/validate.mjs`. Do not edit these tables by hand.

Content fingerprint: `e27e443b1f3d5eed747a103cc371b2d2a329169365ef10b468258f65fc513215`.

## Content totals

| Content | Current amount | Meaning |
| --- | --- | --- |
| Catalogue topics | 15 | 15 have lessons; the others remain outlines |
| Catalogue titles | 44 | 44 implemented as lessons; 0 represented by converted practices; 0 unbuilt titles |
| Core lessons | 44 | All placed on path version 2; no optional lessons |
| General practices | 59 | At least one home practice per lesson; prerequisites may include other content |
| Optional practices | 0 | — |
| Passages | 46 | 46 general; 0 optional |
| Unseen texts | 0 | Separate from passages; also counted as books |
| Library books | 46 | Passages plus unseen texts |
| Vocabulary entries | 1522 | Dictionary records, not a learner vocabulary target |
| Grammar patterns | 116 | Named patterns used for cross-lesson retrieval |
| Checkpoints | 15 | 164 authored recipes; a recipe can contain multiple scored responses |

## Pacing measures

Counts are structural measures, not measured study times. A counted check is one matching pair, sorting card, cloze gap or other scored response. A page is one opening, Words page, Point, exercise item, conversation or finish page in the initial run. Retries and returned reason-check items can add work. Words are table rows, including reused words, not necessarily new vocabulary.

| Content | Counted checks per unit | Initial pages per unit |
| --- | --- | --- |
| Lessons | 36–50 | 30–50 |
| General practices | 46–65 | 36–54 |
| Optional practices | — | — |

There are 1978 counted lesson checks. Every current lesson has 2–4 Points. The first Point in l01p1 appears on page 6.

## Topic coverage

Catalogue titles include implemented and unbuilt entries. Practices and books in this table are grouped by their home lesson's topic, as they are in the app.

| Topic | Catalogue titles | Lessons | Unbuilt titles | General practices | Optional practices | Books |
| --- | --- | --- | --- | --- | --- | --- |
| First Greetings | 3 | 3 | 0 | 4 | 0 | 3 |
| Out Shopping | 3 | 3 | 0 | 4 | 0 | 4 |
| Trains and Buses | 3 | 3 | 0 | 4 | 0 | 4 |
| Day to Day | 3 | 3 | 0 | 4 | 0 | 3 |
| Eating Out | 3 | 3 | 0 | 4 | 0 | 3 |
| Plans and Trips | 3 | 3 | 0 | 4 | 0 | 3 |
| Among Friends | 3 | 3 | 0 | 4 | 0 | 3 |
| Catching Up | 2 | 2 | 0 | 3 | 0 | 2 |
| Rules and Instructions | 3 | 3 | 0 | 4 | 0 | 3 |
| People and Places | 3 | 3 | 0 | 4 | 0 | 3 |
| Saying Thanks | 3 | 3 | 0 | 4 | 0 | 3 |
| Asking a Favour | 4 | 4 | 0 | 5 | 0 | 4 |
| Invitations | 3 | 3 | 0 | 4 | 0 | 3 |
| Good Advice | 3 | 3 | 0 | 4 | 0 | 3 |
| Saying Sorry | 2 | 2 | 0 | 3 | 0 | 2 |

## Lesson sequence and companions

This is the authored display order, not a requirement to finish every earlier lesson. Direct prerequisites and due checkpoints govern access; already-started work keeps access. A home relationship does not itself unlock a companion. Check the practice and book tables for their additional requirements.

| Position | Lesson | Direct prerequisites | Words | Checks | Pages | General companions |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | l01p1 · Nice to Meet You | — | 26 | 46 | 46 | countries-and-jobs, bk01p1 |
| 2 | l01p2 · Nice Weather Today | l01p1 | 27 | 40 | 40 | numbers-to-100, bk01p2 |
| 3 | l01p3 · New Next Door | l01p2 | 21 | 43 | 42 | interview-and-introduce, phone-and-months, bk01p3 |
| 4 | l02p1 · This One, Please | l01p3 | 37 | 49 | 45 | shop-counts-and-prices, bk02p1 |
| 5 | l02p2 · Which Floor? | l02p1 | 33 | 47 | 40 | floors-and-departments, bk02p2 |
| 6 | l02p3 · In Black, Please | l02p2 | 35 | 49 | 45 | colours-and-adjectives, prices-around-the-world, bk02p3, fl02 |
| 7 | l03p1 · How Do You Get There? | l02p3 | 23 | 48 | 44 | places-and-company, bk03p1 |
| 8 | l03p2 · When's the Bus? | l03p1 | 23 | 49 | 44 | times-and-rooms, bk03p2 |
| 9 | l03p3 · Which Platform? | l03p2 | 11 | 46 | 38 | fares-and-platforms, plan-a-route, bk03p3, bk03board |
| 10 | l04p1 · A School Morning | l03p3 | 52 | 48 | 48 | daily-verbs, bk04p1 |
| 11 | l04p2 · Do You Cook? | l04p1 | 19 | 49 | 43 | past-week, bk04p2 |
| 12 | l04p3 · Every Week | l04p2 | 46 | 45 | 40 | my-day-survey, where-things-are, bk04p3 |
| 13 | l05p1 · A Table for Three | l04p3 | 14 | 48 | 46 | invite-and-plan, bk05p1 |
| 14 | l05p2 · I'll Have the Cake | l05p1 | 20 | 40 | 38 | order-from-the-menu, bk05p2 |
| 15 | l05p3 · Delicious! | l05p2 | 20 | 45 | 44 | plan-a-meal-out, taste-and-wants, bk05p3 |
| 16 | l06p1 · Going on a Trip | l05p3 | 40 | 49 | 50 | holiday-plans-and-reasons, bk06p1 |
| 17 | l06p2 · What's Kyoto Like? | l06p1 | 43 | 45 | 48 | sights-and-specialities, bk06p2 |
| 18 | l06p3 · How Was the Trip? | l06p2 | 12 | 45 | 39 | plan-and-present-a-trip, trip-impressions-and-souvenirs, bk06p3 |
| 19 | l07p1 · Plans This Weekend? | l06p3 | 24 | 49 | 40 | casual-weekend-plans, bk07p1 |
| 20 | l07p2 · I'm Not Going | l07p1 | 14 | 49 | 45 | turning-it-down, bk07p2 |
| 21 | l07p3 · What's This? | l07p2 | 23 | 47 | 43 | ask-it-casually, jobs-and-casual-questions, bk07p3 |
| 22 | l08p1 · We Played Football | l07p3 | 15 | 49 | 42 | weekend-casual-past, bk08p1 |
| 23 | l08p2 · How Was It? | l08p1 | 15 | 46 | 38 | day-off-plain-forms, match-and-holiday-talk, bk08p2 |
| 24 | l09p1 · Not There, Please | l08p2 | 34 | 50 | 48 | rubbish-days-and-requests, bk09p1 |
| 25 | l09p2 · No Dictionaries | l09p1 | 21 | 46 | 48 | may-i-test-rules, bk09p2 |
| 26 | l09p3 · Looking at the Textbook | l09p2 | 13 | 45 | 38 | signs-and-what-they-mean, still-doing-it-now, bk09p3 |
| 27 | l10p1 · Which One Is She? | l09p3 | 25 | 47 | 42 | who-is-wearing-what, bk10p1 |
| 28 | l10p2 · My Sister Lives in Beijing | l10p1 | 32 | 49 | 48 | family-jobs-and-homes, bk10p2 |
| 29 | l10p3 · A Town in the South | l10p2 | 17 | 48 | 47 | recommend-a-friend, towns-and-opinions, bk10p3 |
| 30 | l11p1 · Thank You | l10p3 | 27 | 44 | 48 | gifts-lent-and-borrowed, bk11p1 |
| 31 | l11p2 · My Mum Made It | l11p1 | 15 | 37 | 34 | things-people-did-for-me, bk11p2 |
| 32 | l11p3 · Thanks for Your Help | l11p2 | 11 | 36 | 38 | offers-and-thank-yous, thanks-after-a-favour, bk11p3 |
| 33 | l12p1 · Could You Show Me? | l11p3 | 40 | 46 | 49 | forms-tickets-and-how-tos, bk12p1 |
| 34 | l12p2 · Would You Take a Look? | l12p1 | 27 | 43 | 48 | favours-and-first-tries, bk12p2 |
| 35 | l12p3 · Lend Me an Eraser | l12p2 | 21 | 43 | 47 | casual-favours-and-which-one, bk12p3 |
| 36 | l12p4 · May I Go Home? | l12p3 | 24 | 42 | 43 | asking-for-help-in-a-pinch, body-aches-and-sick-days, bk12p4 |
| 37 | l13p1 · How About Japanese Food? | l12p4 | 16 | 46 | 42 | after-work-invitations, bk13p1 |
| 38 | l13p2 · That Day's Tricky | l13p1 | 7 | 37 | 43 | other-days-and-choices, bk13p2 |
| 39 | l13p3 · Want to Try It? | l13p2 | 9 | 38 | 35 | casual-invites-and-plans, join-our-club, bk13p3 |
| 40 | l14p1 · See a Doctor | l13p3 | 16 | 44 | 40 | feeling-unwell-advice, bk14p1 |
| 41 | l14p2 · Try Searching Online | l14p1 | 15 | 39 | 33 | jobs-skills-and-ifs, bk14p2 |
| 42 | l14p3 · Why Not Give It a Go? | l14p2 | 21 | 38 | 40 | advice-for-a-classmate, destination-tips-and-tries, bk14p3 |
| 43 | l15p1 · Sorry I Broke It | l14p3 | 16 | 48 | 41 | accidents-and-apologies, bk15p1 |
| 44 | l15p2 · Sorry! | l15p1 | 8 | 41 | 30 | after-a-mistake, sorry-to-a-friend, bk15p2 |

## Checkpoint boundaries

Checkpoints open once all lessons through their boundary are finished. Answering the entire run completes the checkpoint; misses are recorded and routed to review. Completion is not a mastery pass or evidence of elapsed-time retention.

| Checkpoint | After lesson | New block |
| --- | --- | --- |
| 1 | l01p3 | l01p1, l01p2, l01p3 |
| 2 | l02p3 | l02p1, l02p2, l02p3 |
| 3 | l03p3 | l03p1, l03p2, l03p3 |
| 4 | l04p3 | l04p1, l04p2, l04p3 |
| 5 | l05p3 | l05p1, l05p2, l05p3 |
| 6 | l06p3 | l06p1, l06p2, l06p3 |
| 7 | l07p3 | l07p1, l07p2, l07p3 |
| 8 | l08p2 | l08p1, l08p2 |
| 9 | l09p3 | l09p1, l09p2, l09p3 |
| 10 | l10p3 | l10p1, l10p2, l10p3 |
| 11 | l11p3 | l11p1, l11p2, l11p3 |
| 12 | l12p4 | l12p1, l12p2, l12p3, l12p4 |
| 13 | l13p3 | l13p1, l13p2, l13p3 |
| 14 | l14p3 | l14p1, l14p2, l14p3 |
| 15 | l15p2 | l15p1, l15p2 |

## Practices

| ID and title | Home | Kind | Checks | Pages | Requires |
| --- | --- | --- | --- | --- | --- |
| countries-and-jobs · Countries, people and jobs | l01p1 | General | 64 | 38 | lesson:l01p1 |
| numbers-to-100 · Numbers, greetings and class talk | l01p2 | General | 56 | 38 | lesson:l01p2 |
| interview-and-introduce · Interview a classmate, then introduce them | l01p3 | General | 54 | 42 | lesson:l01p1, lesson:l01p2, lesson:l01p3, practice:countries-and-jobs |
| phone-and-months · Phone numbers, months and moving in | l01p3 | General | 54 | 36 | lesson:l01p3, practice:numbers-to-100 |
| shop-counts-and-prices · Prices, counting and whose it is | l02p1 | General | 65 | 51 | lesson:l02p1, practice:numbers-to-100 |
| floors-and-departments · Floors, departments and the way there | l02p2 | General | 59 | 44 | lesson:l02p2 |
| colours-and-adjectives · Colours, sizes and more adjectives | l02p3 | General | 65 | 40 | lesson:l02p3 |
| prices-around-the-world · Prices around the world | l02p3 | General | 51 | 39 | lesson:l02p1, lesson:l02p2, lesson:l02p3, practice:countries-and-jobs |
| places-and-company · Places in town, and who you go with | l03p1 | General | 64 | 44 | lesson:l03p1 |
| times-and-rooms · Clock times, days and rooms | l03p2 | General | 63 | 42 | lesson:l03p2 |
| fares-and-platforms · Fares, tickets, lines and platforms | l03p3 | General | 65 | 54 | lesson:l03p3 |
| plan-a-route · Plan a route and present it | l03p3 | General | 56 | 49 | lesson:l03p1, lesson:l03p2, lesson:l03p3, practice:fares-and-platforms |
| daily-verbs · How often, what and with whom | l04p1 | General | 64 | 40 | lesson:l04p1 |
| past-week · Yesterday, last week, last month | l04p2 | General | 55 | 38 | lesson:l04p2, practice:daily-verbs |
| my-day-survey · A survey of our days | l04p3 | General | 61 | 45 | lesson:l04p1, lesson:l04p2, lesson:l04p3 |
| where-things-are · Where things and people are | l04p3 | General | 64 | 43 | lesson:l04p3 |
| invite-and-plan · Invitations: where, when and what shall we eat? | l05p1 | General | 62 | 49 | lesson:l05p1 |
| order-from-the-menu · Ordering from a menu | l05p2 | General | 63 | 43 | lesson:l05p2 |
| plan-a-meal-out · Plan a meal out, then tell the group | l05p3 | General | 55 | 48 | lesson:l05p1, lesson:l05p2, lesson:l05p3, practice:invite-and-plan |
| taste-and-wants · Tastes, dishes and what you want | l05p3 | General | 64 | 46 | lesson:l05p3 |
| holiday-plans-and-reasons · Holidays, trips and reasons | l06p1 | General | 64 | 48 | lesson:l06p1 |
| sights-and-specialities · Sights, specialities and what places are like | l06p2 | General | 65 | 43 | lesson:l06p2 |
| plan-and-present-a-trip · Plan a trip, then tell the class about it | l06p3 | General | 46 | 43 | lesson:l06p1, lesson:l06p2, lesson:l06p3, practice:sights-and-specialities |
| trip-impressions-and-souvenirs · Trip impressions, the weather and souvenirs | l06p3 | General | 64 | 42 | lesson:l06p3 |
| casual-weekend-plans · Weekend plans: hobbies, sports and free time | l07p1 | General | 65 | 45 | lesson:l07p1 |
| turning-it-down · Saying no: ない forms, excuses and “please don’t” | l07p2 | General | 63 | 45 | lesson:l07p2 |
| ask-it-casually · Ask it casually: invitations, plans and chats | l07p3 | General | 53 | 43 | lesson:l07p1, lesson:l07p2, lesson:l07p3, practice:jobs-and-casual-questions |
| jobs-and-casual-questions · Jobs, and asking about people casually | l07p3 | General | 64 | 45 | lesson:l07p3 |
| weekend-casual-past · The weekend, casually: ～た and ～なかった | l08p1 | General | 65 | 46 | lesson:l08p1 |
| day-off-plain-forms · Your day off: how it was, in plain forms | l08p2 | General | 65 | 46 | lesson:l08p2 |
| match-and-holiday-talk · A match and the holidays: tell a friend, then tell the group | l08p2 | General | 50 | 38 | lesson:l08p1, lesson:l08p2 |
| rubbish-days-and-requests · Rubbish days and polite requests | l09p1 | General | 65 | 43 | lesson:l09p1 |
| may-i-test-rules · Rules and asking permission | l09p2 | General | 57 | 41 | lesson:l09p2 |
| signs-and-what-they-mean · Signs and what they mean | l09p3 | General | 62 | 42 | lesson:l09p1, lesson:l09p2, lesson:l09p3 |
| still-doing-it-now · Who is doing what right now | l09p3 | General | 64 | 48 | lesson:l09p3 |
| who-is-wearing-what · Who is wearing what? | l10p1 | General | 64 | 50 | lesson:l10p1 |
| family-jobs-and-homes · Family, jobs and homes | l10p2 | General | 64 | 47 | lesson:l10p2 |
| recommend-a-friend · Recommend a friend for a part-time job | l10p3 | General | 55 | 46 | lesson:l10p1, lesson:l10p2, lesson:l10p3 |
| towns-and-opinions · Towns, people and opinions | l10p3 | General | 64 | 44 | lesson:l10p3 |
| gifts-lent-and-borrowed · Given, got, lent and borrowed | l11p1 | General | 60 | 44 | lesson:l11p1 |
| things-people-did-for-me · Things people did for me | l11p2 | General | 54 | 47 | lesson:l11p2 |
| offers-and-thank-yous · Offers and thank-yous | l11p3 | General | 64 | 52 | lesson:l11p3 |
| thanks-after-a-favour · Thanks the next time you meet | l11p3 | General | 57 | 50 | lesson:l11p1, lesson:l11p2, lesson:l11p3 |
| forms-tickets-and-how-tos · Forms, tickets and how-tos | l12p1 | General | 64 | 44 | lesson:l12p1 |
| favours-and-first-tries · Favours and first tries | l12p2 | General | 51 | 43 | lesson:l12p2 |
| casual-favours-and-which-one · Casual favours, and which one | l12p3 | General | 65 | 44 | lesson:l12p3 |
| asking-for-help-in-a-pinch · Asking for help in a pinch | l12p4 | General | 48 | 41 | lesson:l12p1, lesson:l12p2, lesson:l12p3, lesson:l12p4 |
| body-aches-and-sick-days · Aches, fevers and sick days | l12p4 | General | 65 | 42 | lesson:l12p4 |
| after-work-invitations · After-work invitations | l13p1 | General | 62 | 48 | lesson:l13p1 |
| other-days-and-choices · Other days and other choices | l13p2 | General | 59 | 46 | lesson:l13p2 |
| casual-invites-and-plans · Casual invites, plans and hobbies | l13p3 | General | 64 | 46 | lesson:l13p3 |
| join-our-club · Join our club! | l13p3 | General | 52 | 40 | lesson:l13p1, lesson:l13p2, lesson:l13p3 |
| feeling-unwell-advice · Feeling unwell: advice and medicine | l14p1 | General | 64 | 47 | lesson:l14p1 |
| jobs-skills-and-ifs · Jobs, skills and ifs | l14p2 | General | 56 | 41 | lesson:l14p2 |
| advice-for-a-classmate · Advice for a classmate | l14p3 | General | 50 | 38 | lesson:l14p1, lesson:l14p2, lesson:l14p3 |
| destination-tips-and-tries · Destination tips and suggestions | l14p3 | General | 65 | 40 | lesson:l14p3 |
| accidents-and-apologies · Accidents and apologies | l15p1 | General | 64 | 51 | lesson:l15p1 |
| after-a-mistake · After a mistake | l15p2 | General | 46 | 42 | lesson:l15p1, lesson:l15p2 |
| sorry-to-a-friend · Sorry to a friend | l15p2 | General | 64 | 44 | lesson:l15p2 |

## Books

| ID and title | Home | Kind | Requires |
| --- | --- | --- | --- |
| bk01p1 · Who is that? | l01p1 | Passage | lesson:l01p1 |
| bk01p2 · Morning and night | l01p2 | Passage | lesson:l01p2 |
| bk01p3 · Three introductions | l01p3 | Passage | lesson:l01p3, practice:countries-and-jobs |
| bk02p1 · One more thing | l02p1 | Passage | lesson:l02p1 |
| bk02p2 · Not on the first floor | l02p2 | Passage | lesson:l02p2 |
| bk02p3 · The yellow umbrella | l02p3 | Passage | lesson:l02p3 |
| fl02 · The sale flyer | l02p3 | Passage | lesson:l02p3, practice:floors-and-departments |
| bk03p1 · How we get to school | l03p1 | Passage | lesson:l03p1 |
| bk03p2 · How to get to my place | l03p2 | Passage | lesson:l03p2 |
| bk03board · The departure board | l03p3 | Passage | lesson:l03p3 |
| bk03p3 · Where are you now? | l03p3 | Passage | lesson:l03p3 |
| bk04p1 · Tan’s day | l04p1 | Passage | lesson:l04p1 |
| bk04p2 · Marie’s weekend | l04p2 | Passage | lesson:l04p2, practice:daily-verbs |
| bk04p3 · Two emails | l04p3 | Passage | lesson:l04p3 |
| bk05p1 · Off to the airport | l05p1 | Passage | lesson:l05p1 |
| bk05p2 · The A lunch | l05p2 | Passage | lesson:l05p2 |
| bk05p3 · The summer menu | l05p3 | Passage | lesson:l05p3 |
| bk06p1 · A change of plan | l06p1 | Passage | lesson:l06p1 |
| bk06p2 · A guide to Kanazawa | l06p2 | Passage | lesson:l06p2 |
| bk06p3 · A day in Hakone | l06p3 | Passage | lesson:l06p3 |
| bk07p1 · Sunday plans | l07p1 | Passage | lesson:l07p1 |
| bk07p2 · The exchange party | l07p2 | Passage | lesson:l07p2 |
| bk07p3 · Friends from abroad | l07p3 | Passage | lesson:l07p3, practice:jobs-and-casual-questions, practice:countries-and-jobs |
| bk08p1 · A Sunday at the river | l08p1 | Passage | lesson:l08p1 |
| bk08p2 · My first trip to Nara and Kyoto | l08p2 | Passage | lesson:l08p2 |
| bk09p1 · The rubbish calendar | l09p1 | Passage | lesson:l09p1 |
| bk09p2 · Tomorrow’s trip | l09p2 | Passage | lesson:l09p2 |
| bk09p3 · Where are these rules? | l09p3 | Passage | lesson:l09p3 |
| bk10p1 · The class photo | l10p1 | Passage | lesson:l10p1 |
| bk10p2 · My family | l10p2 | Passage | lesson:l10p2 |
| bk10p3 · Guess the job | l10p3 | Passage | lesson:l10p3 |
| bk11p1 · A present for Tan | l11p1 | Passage | lesson:l11p1 |
| bk11p2 · My grandmother’s shirts | l11p2 | Passage | lesson:l11p2 |
| bk11p3 · Are you all right? | l11p3 | Passage | lesson:l11p3 |
| bk12p1 · The leave request form | l12p1 | Passage | lesson:l12p1 |
| bk12p2 · Marie’s first phone call | l12p2 | Passage | lesson:l12p2 |
| bk12p3 · The eraser stays at home | l12p3 | Passage | lesson:l12p3 |
| bk12p4 · The exam notice | l12p4 | Passage | lesson:l12p4 |
| bk13p1 · A change of plan | l13p1 | Passage | lesson:l13p1 |
| bk13p2 · Karaoke moves to Saturday | l13p2 | Passage | lesson:l13p2 |
| bk13p3 · Volunteers wanted | l13p3 | Passage | lesson:l13p3 |
| bk14p1 · Sara’s message | l14p1 | Passage | lesson:l14p1 |
| bk14p2 · The open campus | l14p2 | Passage | lesson:l14p2 |
| bk14p3 · A new kind of hospital | l14p3 | Passage | lesson:l14p3 |
| bk15p1 · Tan’s diary | l15p1 | Passage | lesson:l15p1 |
| bk15p2 · An email to say sorry | l15p2 | Passage | lesson:l15p2 |

## General companions requiring a later lesson

These are valid dependency chains, not unreachable content. The last required lesson is the highest position in the authored sequence reached through all transitive prerequisites. This measure does not estimate elapsed time or add checkpoint requirements. A learner finishing the home lesson may still need a later lesson, practices and books before the companion opens.

| Companion | Home position | Last required lesson position |
| --- | --- | --- |

## Teaching coverage

| Result | Assessment items |
| --- | --- |
| Declared and covered | 3453 |
| Reasoned exceptions | 0 |
| Unchanged legacy items still unreviewed | 0 |
| Known legacy gaps | 0 |
| Validation problems | 0 |

Teaching coverage counts authored assessment items, not the scored responses in the pacing tables. An unchanged legacy item is allowed by the frozen baseline; it is not certified as taught. Coverage checks lessons and practices, not every book question or checkpoint recipe. A declared witness also does not replace Japanese educator review.

## Patterns with limited lesson retrieval

The current pattern re-test pool uses lesson drills. Practices and books may offer additional use, and checkpoints have their own recipes, so this table is not a claim that these patterns appear nowhere else.

| Pattern | Lessons with tagged drills | Topics |
| --- | --- | --- |
| desuka-hai-iie | l01p1 | l01 |
| kara-kimashita | l01p3 | l01 |
| itsu-kimashita | l01p3 | l01 |
| kara-made | l04p1, l04p2 | l04 |
| de-place | l04p1, l04p3 | l04 |
| nanika-dokoka | l05p1 | l05 |
| nan-desuka | l05p2 | l05 |
| demo-but | l05p3 | l05 |
| ga-hoshii | l05p3 | l05 |
| de-he-ikimasu | l03p1 | l03 |
| nande-ikimasu | l03p1 | l03 |
| tai-want | l03p1 | l03 |
| dare-ga | l04p2 | l04 |
| dare-no | l04p2 | l04 |
| koko-soko-asoko | l03p2 | l03 |
| ni-ga-arimasu | l03p2 | l03 |
| nanban | l03p2, l03p3 | l03 |
| kara-made-kakarimasu | l03p3 | l03 |
| doko-ni-imasu | l03p3 | l03 |
| ikura-desuka | l02p1, l02p3 | l02 |
| kore-sore-are | l02p1, l02p3 | l02 |
| wo-kazu-kudasai | l02p1 | l02 |
| doko-desuka | l02p2 | l02 |
| kono-sono-ano | l02p3 | l02 |
| i-adj-no | l02p3 | l02 |
| nanimo-masen | l06p1 | l06 |
| verb-groups | l07p1 | l07 |
| nai-invite | l07p2 | l07 |
| casual-i-adj | l07p3 | l07 |
| casual-da | l07p3 | l07 |
| casual-question-words | l07p3 | l07 |
| te-imasu-wear | l10p1 | l10 |
| te-iru-noun | l10p1 | l10 |
| te-imasu-state | l10p2 | l10 |
| kute-de | l10p2 | l10 |
| wa-ga-adj | l10p3 | l10 |
| ga-but | l10p3 | l10 |
| naide-kudasai | l09p1 | l09 |
| made-ni | l09p1 | l09 |
| de-means | l09p2 | l09 |
| te-imasu | l09p3 | l09 |
| mou-mada | l09p3 | l09 |
| nakatta-past | l08p1 | l08 |
| adj-katta | l08p2 | l08 |
| datta-past | l08p2 | l08 |
| plain-forms | l08p2 | l08 |
| na-adj-noun | l06p2 | l06 |
| donna | l06p2 | l06 |
| na-adj-janai | l06p2 | l06 |
| totemo-amari | l06p2 | l06 |
| i-adj-kattadesu | l06p3 | l06 |
| na-adj-deshita | l06p3 | l06 |
| dou-deshita | l06p3 | l06 |
| agemasu-moraimasu | l11p1, l11p2 | l11 |
| mashouka-decide | l11p1 | l11 |
| ta-toki | l11p1 | l11 |
| toka-list | l11p1 | l11 |
| ndesuga-te-kudasai | l12p1 | l12 |
| masu-kata | l12p1 | l12 |
| te-te-sequence | l12p1 | l12 |
| tara-when | l13p1 | l13 |
| nara-topic | l13p1 | l13 |
| nara-alternative | l13p2 | l13 |
| tari-tari | l13p2 | l13 |
| ato-de | l13p2 | l13 |
| ka-ka-dochira | l13p2 | l13 |
| te-minai | l13p3 | l13 |
| volitional | l13p3 | l13 |
| you-to-omou | l13p3 | l13 |
| hou-ga-ii | l14p1, l14p3 | l14 |
| naru-change | l14p1 | l14 |
| ba-conditional | l14p2 | l14 |
| ga-dekimasu | l14p2 | l14 |
| nara-ga-ii | l14p3 | l14 |
| tara-dou | l14p3 | l14 |
| ta-koto-ga-aru | l14p3 | l14 |
| te-shimau | l15p1, l15p2 | l15 |
| te-shimatte-sumimasen | l15p1 | l15 |
| kereba-nara | l15p1 | l15 |
| nagara | l15p2 | l15 |
| te-moraimasu | l11p2 | l11 |
| dict-toki | l11p2 | l11 |
| te-itadakemasenka | l12p2 | l12 |
| mae-ni | l12p2 | l12 |
| te-mimasu | l12p2 | l12 |
| casual-te | l12p3 | l12 |
| te-kurenai | l12p3 | l12 |
| plain-noun-modifier | l12p3 | l12 |
| mashouka-offer | l11p3 | l11 |
| te-agete-kudasai | l11p3 | l11 |
| te-itadaite | l11p3 | l11 |
| te-cause | l11p3 | l11 |
| node-temo-ii | l12p4 | l12 |
| kara-temo-ii | l12p4 | l12 |
| ndesu-explain | l12p4 | l12 |
| ya-nado | — | — |
| adj-noun-toki | — | — |

## Unseen text sources

| Text | Genre | Source lessons |
| --- | --- | --- |
