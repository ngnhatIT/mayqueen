# Mayqueen homepage mock: notes

Reading of the brief: a homepage mock (spec 5.1, all 13 blocks) for mayqueen.vn, Vietnamese, mobile-first,
women 22–45. No product photographs, no logo file, no Yodetox packaging yet.

## Inventory (things only Mayqueen has)

1. The Mayqueen Slim box: cream card, green waves from pale to fresh green.
2. One box = one bottle of 30 capsules = 30 mornings.
3. Two products that must read as one family: Slim (fresh green), Yodetox (mint, to be confirmed).
4. The combo Slim + Yodetox, cheaper than buying both.
5. The mandatory line printed on the pack: "Thực phẩm này không phải là thuốc…".
6. The label facts: số tiếp nhận công bố, nhà sản xuất, đơn vị phân phối.
7. The herbs (sample until the client confirms): trà xanh, bứa, khoai nưa (Slim); gừng, bồ công anh, lá sen (Yodetox).
8. Vietnamese buying habits: COD, Zalo, freeship threshold, Tỉnh/Quận/Phường.
9. "Sống đẹp cùng Mayqueen": recipes, lifestyle, science, ask-the-expert.
10. The name: May queen, the girl crowned with leaves in spring.

## Argument

1. This is Mayqueen Slim, an herbal capsule, 390.000 đ a box.           → the box front, large
2. One capsule each morning; one bottle is one month.                   → 30 capsules fill a month (scene)
3. Three ways to buy, the combo costs less.                             → price list
4. Not sure which? Five questions pick the course.                      → consultation slip (live thing)
5. What is printed on every box can be checked.                         → the label card
6. Why the brand exists.                                                → the letter tucked inside the box
7. What is inside, plant by plant.                                      → six botanical plates in a row
8. A whole library of living well.                                      → the reading list sheet
9. What a buyer says (sample, moderated).                               → one letter
10. Ask a pharmacist, or choose yourself.                               → two buttons
11. 10% off the first order.                                            → the coupon insert
12. Close: menu, legal line, credits.                                   → footer under a curtain

## Idea

On this page, the Mayqueen Slim box (its cream card, its green waves, its 30 capsules and its printed label)
becomes the stationery of the whole page: the front panel is the first screen, the slip inside is the quiz,
the back label is the trust card, the letter in the box is the story, the coupon is the insert.

Competitor test: another slimming brand's box has other colours, another count, another label; the
sentence does not carry over.

Live thing: the consultation slip. Five questions, a result with the real price and an add-to-cart button;
answering "đang mang thai / cho con bú / điều trị bệnh" sends the visitor to a pharmacist instead.

Scene: 30 capsules leave the bottle one by one and fill the 30 days of a month as the page scrolls.

## Critique

```
ROUND 1
Seen in one second: a cream card "Mayqueen Slim" on a pale green field.
Idea (one sentence): the Mayqueen Slim box becomes the stationery of the whole page.
Live thing: the consultation slip (five questions, a priced course, a pharmacist route for pregnancy/illness).
Layout words by section: hero=card / thirty=held split / prices=list / slip=sheet+stub / label=tilted card /
  letter=split / herbs=drag row / reading=split / review=letter / ask=statement / coupon=coupon / footer=split
Scores: design 7.5 · usability 8 · creativity 7.5 · content 7.5 → overall 7.7
Caps applied: none
Top three problems:
1. Footer menu breaks names over two lines ("Về / Mayqueen") in two narrow columns (desktop-film-03). Fix: one column, nowrap.
2. First screen: flat empty field either side of the card, no product as an object (desktop-fold). Fix: a tabletop with the drawn bottle and Yodetox box.
3. Letter and reading are the same plate-left/sheet-right split (desktop-film-02). Fix: mirror the reading section.

ROUND 2
Seen in one second: the box card with the Slim bottle and the Yodetox box standing on a green table.
Scores: design 8 · usability 8 · creativity 8 · content 7.5 → overall 7.95
Caps applied: none
Top three problems:
1. Review section: heading alone on the left, three empty columns on the right (desktop-film-02). Fix: moderation note in the right column.
2. Phone label card wraps its four lines into seven (mobile-page-02). Fix: body size on the phone.
3. Drag row of herbs reads as cut at 768/390 (inspector side-scroll). Kept: blueprint drag row with buttons, bar and a visible next card.

ROUND 3
Seen in one second: same; review and phone label fixed.
Scores: design 8 · usability 8 · creativity 8 · content 7.5 → overall 7.95
Remaining WARNs defended: palette-cream (the brand's own packaging cream, spec 3.2); side-scroll and empty-middle
(the herbs drag row is the dealt blueprint, cut on purpose); pinned-over-picture (the herbs heading holds its own row
above the plates that slide sideways).
```

## v2 (after client feedback: "not lively, no modern effects, looks cheap")

Cause found: Windows "Animation effects" is off on this machine, so prefers-reduced-motion was "reduce" and v1 showed
no motion at all. v2 adds ?motion=on / a footer switch / a dismissible note so a demo can show the motion.

Redraw: direction re-dealt with --tone bold (stated constraint: modern, lively commerce) → `split-stage`,
seed 2107419122. Type redrawn until Vietnamese glyphs: Archivo. v1 kept in mock/v1/.

Idea: the Mayqueen Slim bottle (rendered in 3D, label printed on a canvas texture with its back panel) is the fixed
stage beside the reading column: it spins with floating capsules, opens and lifts one capsule (ritual), lays out
30 capsules as a month, swaps to Yodetox and to the combo with the tabs, shows each herb as a real photograph, turns
to its back label for "In trên mỗi lọ", and plays the tea clip beside the letter.

Live things: drag to turn the bottle; the consultation (one question at a time) changes the bottle on the stage.

```
ROUND 1 (v2)
Seen in one second: a glossy white Mayqueen Slim bottle with floating green capsules on vivid green, beside a large headline.
Layout words: hero=split stage / ritual=slip / month=figures / shop=tabs / herbs=menu sheet + photo stage / quiz=card /
  prices=list / label=names in columns + back label / letter=sheet + film / living=drag row / review=portrait + quote /
  ask=full-bleed photo + card / coupon=strip + three cells / footer=split
Scores: design 8 · usability 8 · creativity 8.5 · content 7.5 → overall 8.05
Caps applied: none
Top three problems:
1. Rolling digit strips read as 13-line headlines (inspector). Fix: count-up text.
2. Notice line above the wordmark read as an eyebrow; 7 type sizes. Fix: notice as a band; wordmark and quote on the lead step.
3. Off-centre frame (right content ended 137px in). Fix: right-reaching footer text, review photo, stage bar on the margin.

ROUND 2 (v2)
Scores: design 8 · usability 8.5 · creativity 8.5 · content 7.5 → overall 8.2
Remaining WARNs defended: side-scroll and empty-middle both come from the "Sống đẹp" drag row, the dealt blueprint,
cut by the right edge on purpose so it reads as more.
```

## v3 (client: layout not right, scene changes on every section, must scale to many products)

Split stage dropped (archived in mock/v2/). Homepage is now a full-width commerce page: hero with the 3D bottle
(only place it lives; drag to turn), a product grid filtered by need (auto-fill, takes any number of products, with
the 1/3-month toggle, struck single price and saving), one scroll scene (30 capsules fill a month), then calm
sections: herb mosaic, quiz beside a product still, back label still beside the legal list, tea film beside the letter,
living row, review, ask, coupon, footer. The 3D viewer per product belongs on the product detail page.
Inspector: 0 FAIL; WARNs side-scroll and empty-middle come from the living drag row (blueprint).
