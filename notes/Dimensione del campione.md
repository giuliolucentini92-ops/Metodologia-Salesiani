---
tipo: concetto
unita: [2]
---

Quante unità servono perché i risultati siano affidabili? Il ragionamento vale solo se il campione è scelto in modo adeguato. La dimensione dipende da:

1. **livello di confidenza** (di solito 95%, z = 1,96);
2. **margine di errore** E accettato (ad esempio ±5%);
3. **variabilità** del fenomeno nella popolazione, p; se non è nota si usa p = 0,5, che massimizza la dimensione;
4. **dimensione della popolazione** N, rilevante solo se la popolazione è piccola.

**Formula per una proporzione**: n₀ = z² × p(1 − p) / E²

Esempio: z = 1,96, p = 0,5, E = 0,05: n₀ = 3,8416 × 0,25 / 0,0025 ≈ **385**.

**Correzione per popolazioni finite**: n = n₀ / (1 + (n₀ − 1)/N). Per N = 500: n ≈ 384 / 1,77 ≈ **218**.

**Nota critica.** Le slide affermano che più la popolazione è grande più il campione deve essere grande, ma nello stesso esercizio chiariscono che la dimensione della popolazione "non è, di per sé, significativa". Quest'ultima è la lettura corretta: oltre qualche migliaio di unità N non cambia quasi nulla; contano variabilità e precisione richiesta. Con campioni a grappoli servono numeri più alti.

```quiz
D: Quali aspetti fanno crescere la dimensione necessaria del campione?
+ Una maggiore variabilità del carattere da stimare
+ Un margine di errore più piccolo
- Il fatto che la popolazione passi da 100.000 a 1.000.000 di unità
S: Per popolazioni grandi N è quasi irrilevante; contano variabilità e precisione desiderata.
```

Collegamenti: [[Campione]], [[Probabilità]], [[Stima e misura]].
