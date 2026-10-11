* Encoding: UTF-8.
* =====================================================================.
* Metodologia della ricerca educativa - Esercitazione sulla probabilita'.
* Il problema di Monty Hall: simulazione di 500 partite.
* Tre pacchi, un solo premio. Il giocatore sceglie un pacco; il conduttore
* apre uno dei due pacchi rimasti, sempre vuoto. Conviene tenere il proprio
* pacco o cambiare?
* Prima di eseguire: scrivi la tua previsione. Poi confrontala con le
* frequenze simulate. Prova ad aumentare il numero di partite (LOOP).
* =====================================================================.

INPUT PROGRAM.
LOOP trial = 1 TO 500.
  * Posizione del premio (0, 1, 2).
  COMPUTE premio = TRUNC(RV.UNIFORM(0,3)).
  * Scelta iniziale del giocatore.
  COMPUTE giocatore = TRUNC(RV.UNIFORM(0,3)).

  * Pacco aperto dal conduttore: mai quello del giocatore, mai quello con il premio.
  DO IF (giocatore = premio).
    COMPUTE r = TRUNC(RV.UNIFORM(0,2)).
    COMPUTE d0 = MOD(premio+1,3).
    COMPUTE d1 = MOD(premio+2,3).
    COMPUTE conduttore = (r=0)*d0 + (r=1)*d1.
  ELSE.
    COMPUTE conduttore = 3 - premio - giocatore.
  END IF.

  * Pacco su cui si passa cambiando scelta: il terzo rimasto chiuso.
  COMPUTE cambia = 3 - giocatore - conduttore.

  * Esiti (indicatori 0/1).
  COMPUTE secambia = (cambia = premio).
  COMPUTE setiene  = (giocatore = premio).
  END CASE.
END LOOP.
END FILE.
END INPUT PROGRAM.
EXECUTE.

VALUE LABELS secambia setiene 1 'vince' 0 'perde'.

* Stime delle probabilita' di vittoria: la media di un indicatore 0/1 e' una proporzione.
FREQUENCIES VARIABLES=secambia setiene
  /STATISTICS=MEAN.
