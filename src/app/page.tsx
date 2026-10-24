"use client";

import React, { useEffect, useRef } from "react";

const APRESENTO_EVENTS = JSON.stringify([
  { join: "bruno_fts" },
  { chat: { user: "quel.santos", text: "que shake bonito" } },
  {
    question: {
      user: "lari.moraes",
      text: "qual sabor vc usa?",
      answer: "Hoje é o de chocolate. Vire o pote para a câmera e mostre o rótulo.",
    },
  },
  { chat: { user: "thi.alvesz", text: "comprei um agora" } },
  {
    question: {
      user: "dani.rocha",
      text: "dá pra tomar antes do treino?",
      answer: "Dá, sim. Conte como você prepara o seu e mostre a dose na colher.",
    },
  },
  { join: "mah_prado" },
  {
    question: {
      user: "mah_prado",
      text: "quantas doses tem o pote?",
      answer: "Leia no rótulo em voz alta, com o pote perto da câmera.",
    },
  },
]);

const INFINITA_EVENTS = JSON.stringify([
  {
    join: "quel.santos",
    host: "Oi, @quel.santos, que bom te ver aqui!",
    log: "Oi para @quel.santos",
  },
  { chat: { user: "bruno_fts", text: "serve pra pele oleosa?" } },
  {
    host: "@bruno_fts serve, sim: a textura é leve e seca rápido.",
    log: "Pergunta respondida: @bruno_fts",
  },
  { log: "Produto fixado" },
  {
    chat: { user: "lari.moraes", text: "comprei!" },
    host: "Obrigada pela compra, @lari.moraes!",
    log: "Venda comemorada",
  },
  { host: "O link está na sacolinha aqui embaixo.", log: "Comentário automático" },
  {
    join: "dani.rocha",
    host: "Oi, @dani.rocha, seja bem-vinda!",
    log: "Oi para @dani.rocha",
  },
]);

function AstroBrand({ mark = 24 }: { mark?: number }) {
  return (
    <span
      className="brand"
      style={{ "--mark": `${mark}px` } as React.CSSProperties}
      data-astro-cid-6bctqxxv=""
    >
      <svg
        viewBox="0 0 100 100"
        fill="none"
        aria-hidden="true"
        width={mark}
        height={mark}
        data-astro-cid-6bctqxxv=""
      >
        <g
          stroke="currentColor"
          strokeWidth="10.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          data-astro-cid-6bctqxxv=""
        >
          <path d="M25 25H75L25 75H75" data-astro-cid-6bctqxxv="" />
          <path d="M75 25V51" data-astro-cid-6bctqxxv="" />
        </g>
      </svg>
      <span data-astro-cid-6bctqxxv="">Zaalys</span>
    </span>
  );
}

function ArrowUpRight({ size = 17 }: { size?: number }) {
  return (
    <svg
      viewBox="0 0 100 100"
      width={size}
      height={size}
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      <g
        stroke="currentColor"
        strokeWidth="10.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M25 75 75 25" />
        <path d="M49 25H75V51" />
      </g>
    </svg>
  );
}

export default function HomePage() {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const cleanups: Array<() => void> = [];

    // 1. Video reel center & autoplay observer
    const reel = root.querySelector<HTMLElement>("[data-reel]");
    const liveClip = reel?.querySelector<HTMLElement>("[data-live-clip]");
    if (reel && liveClip && reel.scrollWidth > reel.clientWidth) {
      reel.scrollLeft =
        liveClip.getBoundingClientRect().left -
        reel.getBoundingClientRect().left +
        reel.scrollLeft -
        (reel.clientWidth - liveClip.clientWidth) / 2;
    }

    const reducedMotion =
      (navigator as unknown as { connection?: { saveData?: boolean } }).connection?.saveData ===
        true || window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reel && !reducedMotion && "IntersectionObserver" in window) {
      const clips = Array.from(reel.querySelectorAll<HTMLElement>("[data-clip]"));
      const reelObserver = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            const video = entry.target.querySelector<HTMLVideoElement>("video");
            if (video) {
              if (entry.isIntersecting) {
                if (!video.src && video.dataset.src) {
                  video.src = video.dataset.src;
                }
                video.play().catch(() => {});
              } else {
                video.pause();
              }
            }
          }
        },
        { rootMargin: "200px", threshold: 0.25 },
      );
      clips.forEach((c) => reelObserver.observe(c));
      const pauseAllReel = () => clips.forEach((c) => c.querySelector("video")?.pause());
      const onVis = () => {
        if (document.hidden) pauseAllReel();
      };
      document.addEventListener("visibilitychange", onVis);
      window.addEventListener("pagehide", pauseAllReel);
      cleanups.push(() => {
        reelObserver.disconnect();
        document.removeEventListener("visibilitychange", onVis);
        window.removeEventListener("pagehide", pauseAllReel);
      });
    }

    // 2. Live section tabs, video playback, countdown & chat simulation
    const liveEl = root.querySelector<HTMLElement>("[data-live]");
    if (liveEl) {
      const tabs = Array.from(liveEl.querySelectorAll<HTMLButtonElement>("[data-live-tab]"));
      const panels = Array.from(liveEl.querySelectorAll<HTMLElement>("[data-live-panel]"));
      let inView = false;
      liveEl.dataset.ready = "true";

      const getActivePanel = () => panels.find((p) => p.dataset.active === "true");
      const syncLiveVideos = () => {
        for (const panel of panels) {
          const video = panel.querySelector<HTMLVideoElement>("video");
          if (video) {
            if (!reducedMotion && inView && panel === getActivePanel()) {
              if (!video.src && video.dataset.src) {
                video.src = video.dataset.src;
              }
              video.play().catch(() => {});
            } else {
              video.pause();
            }
          }
        }
      };

      const selectTab = (mode: string | undefined, focus = false) => {
        if (!mode) return;
        liveEl.dataset.mode = mode;
        for (const tab of tabs) {
          const active = tab.dataset.liveTab === mode;
          tab.setAttribute("aria-selected", String(active));
          tab.tabIndex = active ? 0 : -1;
          if (active && focus) tab.focus();
        }
        for (const panel of panels) {
          if (panel.dataset.livePanel === mode) {
            panel.dataset.active = "true";
          } else {
            delete panel.dataset.active;
          }
        }
        syncLiveVideos();
      };

      tabs.forEach((tab, idx) => {
        const onClick = () => selectTab(tab.dataset.liveTab);
        const onKeyDown = (ev: KeyboardEvent) => {
          const map: Record<string, number> = {
            ArrowRight: idx + 1,
            ArrowLeft: idx - 1,
            Home: 0,
            End: tabs.length - 1,
          };
          if (!(ev.key in map)) return;
          ev.preventDefault();
          const target = tabs[(map[ev.key] + tabs.length) % tabs.length];
          selectTab(target.dataset.liveTab, true);
        };
        tab.addEventListener("click", onClick);
        tab.addEventListener("keydown", onKeyDown);
        cleanups.push(() => {
          tab.removeEventListener("click", onClick);
          tab.removeEventListener("keydown", onKeyDown);
        });
      });

      const appendItem = (list: Element | null, build: (li: HTMLLIElement) => void) => {
        if (!list) return;
        const li = document.createElement("li");
        build(li);
        li.dataset.fresh = "true";
        list.append(li);
        while (list.children.length > 4) {
          list.firstElementChild?.remove();
        }
      };

      const appendChat = (
        list: Element | null,
        kind: string,
        user: string,
        text: string,
      ) =>
        appendItem(list, (li) => {
          li.dataset.kind = kind;
          const b = document.createElement("b");
          b.textContent = kind === "host" ? user : `@${user}`;
          li.append(b);
          if (kind === "host") {
            const badge = document.createElement("i");
            badge.textContent = "anfitrião";
            li.append(badge);
          }
          li.append(` ${text}`);
        });

      const stateMap = new Map(
        panels.map((p) => [
          p,
          {
            next: 4,
            minute: 8,
            questions: Number(p.querySelector("[data-live-qcount]")?.textContent ?? 0),
          },
        ]),
      );

      const stepChat = () => {
        const panel = getActivePanel();
        if (!panel || !panel.dataset.events) return;
        const events = JSON.parse(panel.dataset.events);
        const st = stateMap.get(panel);
        if (!st) return;
        const ev = events[st.next % events.length];
        st.next += 1;
        const chatList = panel.querySelector("[data-live-chat]");
        if (ev.join) appendChat(chatList, "join", ev.join, "entrou");
        if (ev.chat) appendChat(chatList, "chat", ev.chat.user, ev.chat.text);
        if (ev.question) {
          appendChat(chatList, "chat", ev.question.user, ev.question.text);
          st.questions += 1;
          const qCount = panel.querySelector("[data-live-qcount]");
          const qEl = panel.querySelector("[data-live-question]");
          const aEl = panel.querySelector("[data-live-answer]");
          if (qCount) qCount.textContent = String(st.questions);
          if (qEl) {
            const b = document.createElement("b");
            b.textContent = `@${ev.question.user}`;
            qEl.replaceChildren(b, ` ${ev.question.text}`);
          }
          if (aEl) aEl.textContent = ev.question.answer;
        }
        if (ev.host) appendChat(chatList, "host", "sua.loja", ev.host);
        if (ev.log) {
          const min = st.minute++;
          appendItem(panel.querySelector("[data-live-log]"), (li) => {
            const time = document.createElement("time");
            time.textContent = `${String(21 + Math.floor(min / 60)).padStart(2, "0")}:${String(min % 60).padStart(2, "0")}`;
            li.append(time, ` ${ev.log}`);
          });
        }
      };

      const countdownEl = liveEl.querySelector("[data-live-countdown]");
      let remaining = 160;
      const stepCountdown = () => {
        remaining = remaining <= 0 ? 160 : remaining - 1;
        if (countdownEl) {
          countdownEl.textContent = `${String(Math.floor(remaining / 60)).padStart(2, "0")}:${String(remaining % 60).padStart(2, "0")}`;
        }
      };

      let chatTimer = 0;
      let countTimer = 0;
      const updateTimers = () => {
        const shouldRun = inView && !document.hidden && !reducedMotion;
        if (shouldRun && !chatTimer) {
          chatTimer = window.setInterval(stepChat, 2400);
          countTimer = window.setInterval(stepCountdown, 1000);
        } else if (!shouldRun && chatTimer) {
          window.clearInterval(chatTimer);
          window.clearInterval(countTimer);
          chatTimer = 0;
          countTimer = 0;
        }
        syncLiveVideos();
      };

      if ("IntersectionObserver" in window) {
        const liveObs = new IntersectionObserver(
          (entries) => {
            inView = entries.some((e) => e.isIntersecting);
            updateTimers();
          },
          { rootMargin: "100px", threshold: 0.15 },
        );
        liveObs.observe(liveEl);
        cleanups.push(() => liveObs.disconnect());
      }
      const onPageHide = () => {
        inView = false;
        updateTimers();
      };
      document.addEventListener("visibilitychange", updateTimers);
      window.addEventListener("pagehide", onPageHide);
      cleanups.push(() => {
        if (chatTimer) window.clearInterval(chatTimer);
        if (countTimer) window.clearInterval(countTimer);
        document.removeEventListener("visibilitychange", updateTimers);
        window.removeEventListener("pagehide", onPageHide);
      });
    }

    // 3. Studio sticky 3-step scroll observer + click to switch step
    const studioEl = root.querySelector<HTMLElement>("[data-studio]");
    if (studioEl && "IntersectionObserver" in window) {
      studioEl.dataset.ready = "true";
      const waypoints = Array.from(studioEl.querySelectorAll<HTMLElement>("[data-waypoint]"));
      const activeSet = new Set<number>();
      const studioObs = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            const idx = Number((entry.target as HTMLElement).dataset.waypoint);
            if (entry.isIntersecting) activeSet.add(idx);
            else activeSet.delete(idx);
          }
          if (activeSet.size) {
            studioEl.dataset.active = String(Math.max(...activeSet));
          }
        },
        { rootMargin: "-45% 0px -45% 0px" },
      );
      waypoints.forEach((w) => studioObs.observe(w));

      const steps = Array.from(studioEl.querySelectorAll<HTMLElement>("[data-step]"));
      steps.forEach((step) => {
        const onStepClick = () => {
          if (step.dataset.step) {
            studioEl.dataset.active = step.dataset.step;
          }
        };
        step.style.cursor = "pointer";
        step.addEventListener("click", onStepClick);
        cleanups.push(() => step.removeEventListener("click", onStepClick));
      });

      cleanups.push(() => studioObs.disconnect());
    }

    // 4. Fetch live prices from /api/webhooks/prices
    const formatBrl = (cents: number) => {
      const digits = cents % 100 === 0 ? 0 : 2;
      return new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
        minimumFractionDigits: digits,
        maximumFractionDigits: digits,
      }).format(cents / 100);
    };
    const setPrice = (key: string, text: string) => {
      root.querySelectorAll(`[data-price="${key}"]`).forEach((el) => {
        el.textContent = text;
      });
    };
    const splitPrice = (key: string, cents: number) => {
      const text = formatBrl(cents);
      const comma = text.lastIndexOf(",");
      root.querySelectorAll(`[data-price-whole="${key}"]`).forEach((el) => {
        el.textContent = comma < 0 ? text : text.slice(0, comma);
      });
      root.querySelectorAll(`[data-price-fraction="${key}"]`).forEach((el) => {
        el.textContent = comma < 0 ? "" : text.slice(comma);
      });
    };

    fetch("/api/webhooks/prices")
      .then((r) => (r.ok ? r.json() : { plans: [] }))
      .then((data) => {
        (data?.plans || []).forEach(
          (plan: {
            id?: string;
            priceCents?: number;
            installments?: { count: number; cents: number } | null;
          }) => {
            if (!plan || typeof plan.priceCents !== "number" || plan.priceCents <= 0) return;
            if (plan.id === "monthly") {
              setPrice("monthly", formatBrl(plan.priceCents));
              splitPrice("monthly", plan.priceCents);
            }
            if (plan.id === "lifetime") {
              setPrice("lifetime", formatBrl(plan.priceCents));
              if (plan.installments && plan.installments.cents > 0) {
                setPrice("lifetime-count", String(plan.installments.count));
                setPrice("lifetime-instalment", formatBrl(plan.installments.cents));
                splitPrice("lifetime-instalment", plan.installments.cents);
              }
            }
          },
        );
      })
      .catch(() => {});

    // 5. Coupon banner & Radar form
    const params = new URL(window.location.href).searchParams;
    const rawCoupon = params.get("cupom")?.trim() || params.get("coupon")?.trim();
    const coupon =
      rawCoupon && /^[A-Za-z0-9-]{3,40}$/.test(rawCoupon) ? rawCoupon.toUpperCase() : null;
    const couponBanner = root.querySelector<HTMLElement>("[data-coupon-banner]");
    if (coupon && couponBanner) {
      // Só mostra o banner se o servidor confirmar o cupom.
      fetch(`/api/checkout/coupon?code=${encodeURIComponent(coupon)}`)
        .then((r) => (r.ok ? r.json() : null))
        .then((data: { valid?: boolean; discountCents?: number } | null) => {
          if (!data?.valid || !data.discountCents) return;
          const codeEl = couponBanner.querySelector("[data-coupon-code]");
          if (codeEl) codeEl.textContent = coupon;
          const valueEl = couponBanner.querySelector("[data-coupon-value]");
          if (valueEl) valueEl.textContent = `${formatBrl(data.discountCents)} de desconto`;
          couponBanner.hidden = false;
        })
        .catch(() => {});
    }

    const radarForm = root.querySelector<HTMLFormElement>("[data-radar-form]");
    const radarStatus = radarForm?.querySelector<HTMLElement>("[data-radar-status]");
    const renderedAt = radarForm?.querySelector<HTMLInputElement>("[data-rendered-at]");
    if (renderedAt) renderedAt.value = String(Date.now());

    if (radarForm) {
      const onSubmitRadar = async (ev: Event) => {
        ev.preventDefault();
        const btn = radarForm.querySelector<HTMLButtonElement>("button[type=submit]");
        if (btn) btn.disabled = true;
        try {
          const res = await fetch(radarForm.action, {
            method: "POST",
            body: new FormData(radarForm),
            headers: { Accept: "application/json" },
          });
          if (res.ok && radarStatus) {
            radarStatus.textContent =
              "Quase lá: enviamos um link para o seu e-mail. Toque nele para confirmar e receber a lista desta semana.";
            radarStatus.dataset.state = "ok";
            radarForm.reset();
          } else if (radarStatus) {
            radarStatus.textContent = "Confira o e-mail digitado e tente de novo.";
            radarStatus.dataset.state = "error";
          }
        } catch {
          if (radarStatus) {
            radarStatus.textContent = "Confira o e-mail digitado e tente de novo.";
            radarStatus.dataset.state = "error";
          }
        } finally {
          if (btn) btn.disabled = false;
        }
      };
      radarForm.addEventListener("submit", onSubmitRadar);
      cleanups.push(() => radarForm.removeEventListener("submit", onSubmitRadar));
    }

    // 6. Sticky mobile CTA bar
    const stickyCta = root.querySelector<HTMLElement>("[data-sticky-cta]");
    const heroActions = root.querySelector<HTMLElement>("[data-hero-actions]");
    const acessoSection = root.querySelector<HTMLElement>("#acesso");
    const closingTitle = root.querySelector<HTMLElement>("#closing-title");
    if (stickyCta && heroActions && acessoSection && "IntersectionObserver" in window) {
      const visibleMap = new Map<Element, boolean>();
      const updateSticky = () => {
        const show = !Array.from(visibleMap.values()).some(Boolean);
        stickyCta.hidden = false;
        stickyCta.dataset.show = String(show);
      };
      const stickyObs = new IntersectionObserver((entries) => {
        for (const entry of entries) {
          visibleMap.set(entry.target, entry.isIntersecting);
        }
        updateSticky();
      });
      [heroActions, acessoSection, closingTitle].filter(Boolean).forEach((el) => {
        if (el) stickyObs.observe(el);
      });
      cleanups.push(() => stickyObs.disconnect());
    }

    // 7. Reveal animations on scroll
    const reveals = Array.from(root.querySelectorAll<HTMLElement>(".reveal"));
    if (reveals.length) {
      document.documentElement.dataset.revealReady = "true";
      let ticking = false;
      const checkReveals = () => {
        ticking = false;
        const threshold = window.innerHeight * 0.88;
        for (let i = reveals.length - 1; i >= 0; i--) {
          if (reveals[i].getBoundingClientRect().top < threshold) {
            reveals[i].dataset.revealed = "true";
            reveals.splice(i, 1);
          }
        }
        if (!reveals.length) {
          window.removeEventListener("scroll", onScroll);
          window.removeEventListener("resize", onScroll);
        }
      };
      const onScroll = () => {
        if (!ticking) {
          ticking = true;
          requestAnimationFrame(checkReveals);
        }
      };
      window.addEventListener("scroll", onScroll, { passive: true });
      window.addEventListener("resize", onScroll, { passive: true });
      checkReveals();
      cleanups.push(() => {
        window.removeEventListener("scroll", onScroll);
        window.removeEventListener("resize", onScroll);
      });
    }

    return () => {
      cleanups.forEach((fn) => fn());
    };
  }, []);

  return (
    <div ref={rootRef} className="dark _landing_1pscc_1">
      <a href="#conteudo" className="_skip_1pscc_20">
        Pular para o conteúdo
      </a>

      <header className="_header_1pscc_22">
        <nav className="_nav_1pscc_23" aria-label="Navegação principal">
          <a href="/" aria-label="Zaalys, início">
            <AstroBrand mark={24} />
          </a>
          <div className="_navLinks_1pscc_24">
            <a href="#live" className="_navKeep_1pscc_418">
              Live
            </a>
            <a href="#como-funciona">Vídeos</a>
            <a href="#estudio">Estúdio</a>
            <a href="#recebe">O que você recebe</a>
            <a href="#acesso" className="_navKeep_1pscc_418">
              Preços
            </a>
          </div>
          <a href="/login" className="_login_1pscc_25">
            Entrar
          </a>
        </nav>
      </header>

      <p className="_couponBanner_1pscc_113" data-coupon-banner="" hidden role="status">
        Cupom <strong data-coupon-code=""></strong>: <span data-coupon-value="">desconto</span> no
        acesso vitalício. O desconto aparece no pagamento.
      </p>

      <main id="conteudo">
        <section className="_hero_1pscc_35" aria-labelledby="hero-title">
          <h1 id="hero-title">
            Sua live no TikTok Shop,
            <br />
            <span>no automático.</span>
          </h1>
          <p>
            Seus clipes em loop, comentários, produto fixado e oi para quem entra.
            <br className="_desktopBreak_1pscc_425" /> E os vídeos com seu influencer de IA, no
            mesmo acesso.
          </p>
          <div className="_heroActions_1pscc_39" data-hero-actions="">
            <a
              href="/checkout/vitalicio?from=hero-lifetime"
              className="_primary_1pscc_28"
            >
              Acesso vitalício{" "}
              <span>
                <span data-price="lifetime-count">12</span>x de{" "}
                <span data-price="lifetime-instalment">R$ 84,60</span>
              </span>{" "}
              <ArrowUpRight size={17} />
            </a>
            <a
              href="/checkout/vitalicio?plan=monthly&from=hero-monthly"
              className="_secondaryAction_1pscc_29"
            >
              Plano mensal{" "}
              <span>
                <span data-price="monthly">R$ 540</span>/mês
              </span>
            </a>
          </div>
          <p className="_heroAside_1pscc_45">
            <a href="/termos#arrependimento">
              Veja as condições de cancelamento e reembolso.
            </a>
            As mesmas ferramentas nos dois planos: <a href="#acesso">comparar</a> ou{" "}
            <a href="#live">ver a live em ação</a>.
          </p>

          <div
            className="_reel_1pscc_13"
            aria-label="Prévia dos templates de vídeo e da live"
            data-reel=""
          >
            <figure className="_clip_1pscc_13" data-clip="">
              <video
                poster="/media/templates/21_apresentando-produto.jpg"
                data-src="/media/templates/21_apresentando-produto.mp4"
                preload="none"
                muted
                loop
                playsInline
                disablePictureInPicture
                aria-hidden="true"
              />
              <span className="_clipTop_1pscc_13">Seu próximo vídeo</span>
              <figcaption className="_clipBottom_1pscc_54">Apresente o produto</figcaption>
            </figure>

            <figure className="_clip_1pscc_13" data-clip="">
              <video
                poster="/media/templates/24_setup-mesa.jpg"
                data-src="/media/templates/24_setup-mesa.mp4"
                preload="none"
                muted
                loop
                playsInline
                disablePictureInPicture
                aria-hidden="true"
              />
              <span className="_clipTop_1pscc_13">Casa &amp; setup</span>
              <figcaption className="_clipBottom_1pscc_54">Monte a cena</figcaption>
            </figure>

            <figure className="_clip_1pscc_13 _clipLive_1pscc_296" data-clip="" data-live-clip="">
              <video
                poster="/media/templates/19_textura-pele.jpg"
                data-src="/media/templates/19_textura-pele.mp4"
                preload="none"
                muted
                loop
                playsInline
                disablePictureInPicture
                aria-hidden="true"
              />
              <span className="_liveFrameShade_1pscc_302" aria-hidden="true" />
              <div className="_liveTop_1pscc_242" aria-hidden="true">
                <span className="_liveHost_1pscc_243">sua.loja</span>
                <span className="_liveBadge_1pscc_245">LIVE</span>
                <span className="_liveViewers_1pscc_246">138</span>
              </div>
              <figcaption className="_liveBottom_1pscc_247">
                <span className="_srOnly_1pscc_130">
                  Exemplo de live infinita: clipe em loop, chat e produto fixado.
                </span>
                <ol className="_liveChat_1pscc_248" aria-hidden="true">
                  <li data-kind="join">
                    <b>@quel.santos</b> entrou
                  </li>
                  <li data-kind="chat">
                    <b>@bruno_fts</b> serve pra pele oleosa?
                  </li>
                  <li data-kind="host">
                    <b>sua.loja</b>
                    <i>anfitrião</i> @bruno_fts serve, sim: textura leve.
                  </li>
                </ol>
                <p className="_livePinned_1pscc_256" aria-hidden="true">
                  <span>Fixado</span>
                  <strong>Sérum facial</strong>
                  <em>R$ 49,90</em>
                </p>
              </figcaption>
            </figure>

            <figure className="_clip_1pscc_13" data-clip="">
              <video
                poster="/media/templates/23_preparo-e-gole.jpg"
                data-src="/media/templates/23_preparo-e-gole.mp4"
                preload="none"
                muted
                loop
                playsInline
                disablePictureInPicture
                aria-hidden="true"
              />
              <span className="_clipTop_1pscc_13">Rotina</span>
              <figcaption className="_clipBottom_1pscc_54">Mostre na prática</figcaption>
            </figure>

            <figure className="_clip_1pscc_13" data-clip="">
              <video
                poster="/media/templates/25_pet-experimentando.jpg"
                data-src="/media/templates/25_pet-experimentando.mp4"
                preload="none"
                muted
                loop
                playsInline
                disablePictureInPicture
                aria-hidden="true"
              />
              <span className="_clipTop_1pscc_13">Pets</span>
              <figcaption className="_clipBottom_1pscc_54">Explore seu nicho</figcaption>
            </figure>
          </div>

          <div className="_reelCaption_1pscc_13">
            <span>No meio, uma live infinita. Em volta, templates do estúdio.</span>
            <span>Chat e produto de exemplo.</span>
          </div>
        </section>

        <aside className="_whyNow_1pscc_81 reveal" aria-label="O que os dados mostram">
          <p>
            Perfis de IA já publicam <strong>5,72% das ofertas de venda</strong> do TikTok Shop, e
            a conversão desses perfis subiu <strong>28% em seis meses</strong>.
          </p>
          <cite>
            Estudo da Timelens com 15.326 links de venda, jul/2024 a jan/2025,{" "}
            <a
              href="https://www.infomoney.com.br/colunistas/renato-dolci/o-fim-do-influenciador-como-a-ia-esta-silenciosamente-tomando-o-fundo-do-funil-do-tiktok/"
              rel="noopener noreferrer"
              target="_blank"
            >
              publicado na InfoMoney
            </a>
            .
          </cite>
        </aside>

        <section id="live" className="_liveBand_1pscc_205" aria-labelledby="live-title">
          <div className="_section_1pscc_137">
            <div className="_liveHeading_1pscc_207 reveal">
              <h2 id="live-title">
                A live roda com você
                <br />
                <span>ou sem você na câmera.</span>
              </h2>
              <p>
                Apresente com o roteiro e o chat na sua frente, ou deixe a extensão tocar a live
                com seus clipes em loop.
              </p>
            </div>

            <div className="reveal">
              <div className="_live_1pscc_205" data-live="" data-mode="apresento">
                <div
                  className="_liveTabs_1pscc_211"
                  role="tablist"
                  aria-label="Como você faz a live"
                >
                  <button
                    type="button"
                    role="tab"
                    id="live-tab-apresento"
                    aria-controls="live-panel-apresento"
                    aria-selected="true"
                    tabIndex={0}
                    data-live-tab="apresento"
                  >
                    <strong>Eu apresento</strong>
                    <span>Você na câmera, com roteiro e chat na sua frente</span>
                  </button>
                  <button
                    type="button"
                    role="tab"
                    id="live-tab-infinita"
                    aria-controls="live-panel-infinita"
                    aria-selected="false"
                    tabIndex={-1}
                    data-live-tab="infinita"
                  >
                    <strong>Live infinita</strong>
                    <span>Seus clipes em loop, com a extensão no comando</span>
                  </button>
                </div>

                {/* Panel 1: Eu apresento */}
                <div
                  className="_livePanel_1pscc_223"
                  id="live-panel-apresento"
                  role="tabpanel"
                  aria-labelledby="live-tab-apresento"
                  data-live-panel="apresento"
                  data-events={APRESENTO_EVENTS}
                  data-active="true"
                >
                  <h3 className="_livePanelTitle_1pscc_228">Eu apresento</h3>
                  <ul className="_liveFeatures_1pscc_230">
                    <li>
                      <ArrowUpRight size={15} />
                      <div>
                        <strong>Roteiro com IA</strong>
                        <span>
                          Para até cinco produtos: a abertura, o que mostrar na câmera, os
                          argumentos e as respostas para as perguntas mais comuns.
                        </span>
                      </div>
                    </li>
                    <li>
                      <ArrowUpRight size={15} />
                      <div>
                        <strong>Modo live</strong>
                        <span>
                          O roteiro em tela cheia, com cronômetro por etapa e o próximo passo à
                          vista. Avança pelo teclado.
                        </span>
                      </div>
                    </li>
                    <li>
                      <ArrowUpRight size={15} />
                      <div>
                        <strong>Chat da live</strong>
                        <span>
                          Conecte seu @ e veja as perguntas de quem quer comprar separadas do
                          resto, com uma resposta sugerida.
                        </span>
                      </div>
                    </li>
                  </ul>

                  <div className="_liveStage_1pscc_236">
                    <figure className="_liveFrame_1pscc_237">
                      <video
                        poster="/media/templates/23_preparo-e-gole.jpg"
                        data-src="/media/templates/23_preparo-e-gole.mp4"
                        preload="none"
                        muted
                        loop
                        playsInline
                        disablePictureInPicture
                        aria-hidden="true"
                      />
                      <img
                        className="_liveFrameStill_1pscc_238"
                        src="/media/templates/23_preparo-e-gole.jpg"
                        alt="Criador apresentando um pote de whey protein na cozinha"
                        width={720}
                        height={1280}
                        loading="lazy"
                      />
                      <div className="_liveTop_1pscc_242" aria-hidden="true">
                        <span className="_liveHost_1pscc_243">sua.loja</span>
                        <span className="_liveBadge_1pscc_245">LIVE</span>
                        <span className="_liveViewers_1pscc_246">214</span>
                      </div>
                      <div className="_liveBottom_1pscc_247">
                        <ol
                          className="_liveChat_1pscc_248"
                          data-live-chat=""
                          aria-label="Chat da live, exemplo"
                        >
                          <li data-kind="join">
                            <b>@bruno_fts</b> entrou
                          </li>
                          <li data-kind="chat">
                            <b>@quel.santos</b> que shake bonito
                          </li>
                          <li data-kind="chat">
                            <b>@lari.moraes</b> qual sabor vc usa?
                          </li>
                          <li data-kind="chat">
                            <b>@thi.alvesz</b> comprei um agora
                          </li>
                        </ol>
                        <p className="_livePinned_1pscc_256">
                          <span>Fixado</span>
                          <strong>Whey protein 900 g</strong>
                          <em>R$ 89,90</em>
                        </p>
                      </div>
                    </figure>

                    <div className="_liveConsole_1pscc_261">
                      <div className="_previewBar_1pscc_169">
                        <span className="_previewBrand_1pscc_171">
                          <AstroBrand mark={16} />
                          <span>modo live</span>
                        </span>
                        <span>Exemplo ilustrativo</span>
                      </div>
                      <div className="_liveConsoleBody_1pscc_262">
                        <div className="_liveStep_1pscc_263">
                          <span>Argumentos de venda</span>
                          <time data-live-countdown="">02:40</time>
                        </div>
                        <p className="_liveCue_1pscc_265">
                          Prepare o shake na frente da câmera e mostre a dose na colher.
                        </p>
                        <p className="_liveNext_1pscc_266">Depois: perguntas do chat</p>
                        <div className="_liveQuestion_1pscc_267">
                          <p className="_liveQuestionHead_1pscc_268">
                            Perguntas (<span data-live-qcount="">1</span>)
                          </p>
                          <p data-live-question="">
                            <b>@lari.moraes</b> qual sabor vc usa?
                          </p>
                          <p className="_liveAnswer_1pscc_270">
                            <span>Resposta sugerida</span>
                            <span data-live-answer="">
                              Hoje é o de chocolate. Vire o pote para a câmera e mostre o rótulo.
                            </span>
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Panel 2: Live infinita */}
                <div
                  className="_livePanel_1pscc_223"
                  id="live-panel-infinita"
                  role="tabpanel"
                  aria-labelledby="live-tab-infinita"
                  data-live-panel="infinita"
                  data-events={INFINITA_EVENTS}
                >
                  <h3 className="_livePanelTitle_1pscc_228">Live infinita</h3>
                  <ul className="_liveFeatures_1pscc_230">
                    <li>
                      <ArrowUpRight size={15} />
                      <div>
                        <strong>Seus clipes viram a câmera</strong>
                        <span>
                          Os clipes do produto rodam em loop como o vídeo da live, com narração no
                          lugar do microfone.
                        </span>
                      </div>
                    </li>
                    <li>
                      <ArrowUpRight size={15} />
                      <div>
                        <strong>Comenta e fixa o produto</strong>
                        <span>
                          Comentários automáticos no ritmo que você escolher, e o produto fixado
                          de novo a cada minuto.
                        </span>
                      </div>
                    </li>
                    <li>
                      <ArrowUpRight size={15} />
                      <div>
                        <strong>Recebe quem chega</strong>
                        <span>
                          Dá oi pelo nome para quem entra, responde perguntas e comemora cada
                          venda.
                        </span>
                      </div>
                    </li>
                    <li>
                      <ArrowUpRight size={15} />
                      <div>
                        <strong>Vários produtos na mesma live</strong>
                        <span>
                          Até oito produtos, trocando sozinho, cada um com os próprios clipes.
                        </span>
                      </div>
                    </li>
                  </ul>

                  <div className="_liveStage_1pscc_236">
                    <figure className="_liveFrame_1pscc_237">
                      <video
                        poster="/media/templates/19_textura-pele.jpg"
                        data-src="/media/templates/19_textura-pele.mp4"
                        preload="none"
                        muted
                        loop
                        playsInline
                        disablePictureInPicture
                        aria-hidden="true"
                      />
                      <img
                        className="_liveFrameStill_1pscc_238"
                        src="/media/templates/19_textura-pele.jpg"
                        alt="Mãos mostrando um frasco de sérum facial"
                        width={720}
                        height={1280}
                        loading="lazy"
                      />
                      <div className="_liveTop_1pscc_242" aria-hidden="true">
                        <span className="_liveHost_1pscc_243">sua.loja</span>
                        <span className="_liveBadge_1pscc_245">LIVE</span>
                        <span className="_liveViewers_1pscc_246">138</span>
                      </div>
                      <div className="_liveBottom_1pscc_247">
                        <ol
                          className="_liveChat_1pscc_248"
                          data-live-chat=""
                          aria-label="Chat da live, exemplo"
                        >
                          <li data-kind="join">
                            <b>@quel.santos</b> entrou
                          </li>
                          <li data-kind="host">
                            <b>sua.loja</b>
                            <i>anfitrião</i> Oi, @quel.santos, que bom te ver aqui!
                          </li>
                          <li data-kind="chat">
                            <b>@bruno_fts</b> serve pra pele oleosa?
                          </li>
                          <li data-kind="host">
                            <b>sua.loja</b>
                            <i>anfitrião</i> @bruno_fts serve, sim: a textura é leve e seca rápido.
                          </li>
                        </ol>
                        <p className="_livePinned_1pscc_256">
                          <span>Fixado</span>
                          <strong>Sérum facial 30 ml</strong>
                          <em>R$ 49,90</em>
                        </p>
                      </div>
                    </figure>

                    <div className="_liveConsole_1pscc_261">
                      <div className="_previewBar_1pscc_169">
                        <span className="_previewBrand_1pscc_171">
                          <AstroBrand mark={16} />
                          <span>Zaalys Live</span>
                        </span>
                        <span>Exemplo ilustrativo</span>
                      </div>
                      <div className="_liveConsoleBody_1pscc_262">
                        <ul className="_liveSwitches_1pscc_272">
                          <li>
                            <span>Comentários automáticos</span>
                            <span className="_liveOn_1pscc_274">ligado</span>
                          </li>
                          <li>
                            <span>Fixar produto</span>
                            <span className="_liveOn_1pscc_274">ligado</span>
                          </li>
                          <li>
                            <span>Dar oi para quem entra</span>
                            <span className="_liveOn_1pscc_274">ligado</span>
                          </li>
                          <li>
                            <span>Responder perguntas</span>
                            <span className="_liveOn_1pscc_274">ligado</span>
                          </li>
                          <li>
                            <span>Comemorar vendas</span>
                            <span className="_liveOn_1pscc_274">ligado</span>
                          </li>
                        </ul>
                        <p className="_liveLogHead_1pscc_275">Atividade</p>
                        <ol className="_liveLog_1pscc_275" data-live-log="">
                          <li>
                            <time>21:04</time> Oi para @quel.santos
                          </li>
                          <li>
                            <time>21:06</time> Pergunta respondida: @bruno_fts
                          </li>
                          <li>
                            <time>21:07</time> Produto fixado
                          </li>
                        </ol>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="_liveSetup_1pscc_281 reveal">
              <h3>Para ligar a live infinita</h3>
              <ol>
                <li>
                  <strong>Gere os clipes</strong>
                  <span>
                    No Google Flow, com os prompts que a Zaalys escreve para o seu produto.
                  </span>
                </li>
                <li>
                  <strong>Instale a extensão</strong>
                  <span>
                    A Zaalys Live, no Chrome do computador. Um passo a passo mostra cada clique.
                  </span>
                </li>
                <li>
                  <strong>Ligue a live</strong>
                  <span>
                    Na página de LIVE do TikTok Shop, com o painel da extensão todo verde.
                  </span>
                </li>
              </ol>
            </div>

            <div className="_liveAlert_1pscc_282 reveal">
              <div>
                <h3>
                  Se a live cair,
                  <br />
                  seu celular avisa.
                </h3>
                <p>
                  Queda, aviso de violação ou fim da live: o aviso chega no celular, mesmo com o
                  site fechado.
                </p>
              </div>
              <p>
                Extensões que só fazem a live automática cobram de R$ 79 a R$ 199 por mês. Aqui o
                Assistente de Live vem <strong>junto com o estúdio, nos dois planos</strong>.
                <br />
                <a href="#acesso" className="_textLink_1pscc_30">
                  Ver planos
                </a>
              </p>
            </div>
          </div>
        </section>

        <section
          id="como-funciona"
          className="_section_1pscc_137"
          aria-labelledby="workflow-title"
        >
          <div className="_sectionHeading_1pscc_139 reveal">
            <h2 id="workflow-title">
              E os vídeos: você escolhe
              <br />o produto e dá forma à ideia.
            </h2>
            <p>
              Um lugar para pesquisar o que vender e preparar o que publicar. Role a página para
              percorrer as etapas do estúdio.
            </p>
          </div>

          <div className="_studio_1pscc_147" data-studio="" data-active="0">
            <ol className="_steps_1pscc_148">
              <li className="_step_1pscc_148" data-step="0">
                <strong>Encontre seu produto</strong>
                <span>
                  Compare preço e comissão no catálogo. Escolha um produto que faça sentido para o
                  seu público.
                </span>
              </li>
              <li className="_step_1pscc_148" data-step="1">
                <strong>Escolha quem apresenta</strong>
                <span>
                  Use um modelo do estúdio ou crie seu influencer. Defina a aparência que combina
                  com o conteúdo.
                </span>
              </li>
              <li className="_step_1pscc_148" data-step="2">
                <strong>Leve a ideia para o vídeo</strong>
                <span>
                  Prepare o roteiro e o prompt. Copie para Flow ou Veo e gere o vídeo na
                  ferramenta externa.
                </span>
              </li>
            </ol>

            <div className="_studioTrack_1pscc_161">
              <div className="_studioSticky_1pscc_162">
                <div className="_preview_1pscc_168">
                  <div className="_previewBar_1pscc_169">
                    <span className="_previewBrand_1pscc_171">
                      <AstroBrand mark={18} />
                      <span>estúdio</span>
                    </span>
                    <span>Exemplo ilustrativo</span>
                  </div>

                  <div className="_previewStack_1pscc_174">
                    <div className="_previewContent_1pscc_173" data-panel="0">
                      <div className="_demoSearch_1pscc_180">
                        <svg
                          width="17"
                          height="17"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.75"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          aria-hidden="true"
                          focusable="false"
                        >
                          <path d="m21 21-4.35-4.35" />
                          <path d="M19 11a8 8 0 1 1-16 0 8 8 0 0 1 16 0" />
                        </svg>
                        <span>Um produto para a rotina</span>
                      </div>
                      <div className="_productDemo_1pscc_181">
                        <img
                          src="/media/templates/23_preparo-e-gole.jpg"
                          alt="Exemplo de cena de preparo de uma bebida"
                          width={720}
                          height={1280}
                          loading="lazy"
                        />
                        <div>
                          <span>Suplementos</span>
                          <h3>Whey protein</h3>
                          <dl>
                            <div>
                              <dt>Preço do exemplo</dt>
                              <dd>R$ 89,90</dd>
                            </div>
                            <div>
                              <dt>Comissão do exemplo</dt>
                              <dd>15%</dd>
                            </div>
                            <div>
                              <dt>Você recebe por venda</dt>
                              <dd className="_demoHighlight_1pscc_189">R$ 13,48</dd>
                            </div>
                          </dl>
                          <p className="_demoNote_1pscc_13">
                            Produto e valores ilustrativos. Consulte as ofertas no catálogo.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="_previewContent_1pscc_173" data-panel="1">
                      <div className="_modelDemo_1pscc_191">
                        <figure>
                          <img
                            src="/media/models/woman-casual.webp"
                            alt="Personagem feminino casual do estúdio"
                            width={368}
                            height={656}
                            loading="lazy"
                          />
                          <figcaption>Casual feminino</figcaption>
                        </figure>
                        <figure>
                          <img
                            src="/media/models/man-smart.webp"
                            alt="Personagem masculino social do estúdio"
                            width={368}
                            height={656}
                            loading="lazy"
                          />
                          <figcaption>Social masculino</figcaption>
                        </figure>
                        <p className="_demoNote_1pscc_13">
                          Modelos prontos no estúdio. Você também pode criar seu próprio
                          influencer.
                        </p>
                      </div>
                    </div>

                    <div className="_previewContent_1pscc_173" data-panel="2">
                      <div className="_promptDemo_1pscc_196">
                        <div>
                          <span>Prompt de exemplo</span>
                          <span>9:16 · PT-BR</span>
                        </div>
                        <p>
                          Vídeo vertical 9:16. Uma criadora apresenta um pote de whey protein em
                          uma cozinha com luz natural. Plano médio, câmera na altura dos olhos. A
                          pessoa segura o pote, mostra a embalagem e coloca sobre a bancada.
                          Movimento de câmera suave. Preserve a aparência do produto de
                          referência. Fala em português: ‘Hoje vou mostrar como eu preparo o meu
                          shake.’
                        </p>
                        <span className="_externalNote_1pscc_13">
                          Próxima etapa: renderizar no Flow / Veo, com acesso separado.
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="_waypoint_1pscc_163" data-waypoint="0" aria-hidden="true" />
              <div className="_waypoint_1pscc_163" data-waypoint="1" aria-hidden="true" />
              <div className="_waypoint_1pscc_163" data-waypoint="2" aria-hidden="true" />
            </div>
          </div>
        </section>

        <section
          id="estudio"
          className="_section_1pscc_137 _creatorSection_1pscc_305"
          aria-labelledby="creator-title"
        >
          <div className="_creatorArt_1pscc_306 reveal">
            <img
              src="/media/models/woman-casual.webp"
              alt="Modelo de IA com camiseta branca e jeans"
              width={368}
              height={656}
              loading="lazy"
            />
            <img
              src="/media/models/man-smart.webp"
              alt="Modelo masculino de IA com roupa social"
              width={368}
              height={656}
              loading="lazy"
            />
            <span>Personagens de IA disponíveis no estúdio</span>
          </div>
          <div className="_creatorCopy_1pscc_310 reveal">
            <h2 id="creator-title">
              Um rosto para
              <br />o seu conteúdo.
            </h2>
            <p>
              Escolha um modelo ou crie seu próprio influencer. Ajuste a aparência e reutilize o
              personagem nas próximas ideias.
            </p>
            <ul className="_featureList_1pscc_311">
              <li>
                <ArrowUpRight size={13} /> Criação guiada de personagens
              </li>
              <li>
                <ArrowUpRight size={13} /> Modelos para diferentes estilos de conteúdo
              </li>
              <li>
                <ArrowUpRight size={13} /> Templates com cena e movimento definidos
              </li>
            </ul>
            <a href="/checkout/vitalicio?from=creator" className="_textLink_1pscc_30">
              Criar com a Zaalys
            </a>
          </div>
        </section>

        <section id="recebe" className="_section_1pscc_137" aria-labelledby="delivery-title">
          <div className="_sectionHeading_1pscc_139 reveal">
            <h2 id="delivery-title">
              O que entra na
              <br />
              sua conta hoje.
            </h2>
            <p>Tudo abaixo vem nos dois planos. Nada é vendido à parte e nada é cobrado por uso.</p>
          </div>
          <div className="_headlineTools_1pscc_318">
            <article className="reveal" data-reveal-delay="0">
              <p className="_wasPrice_1pscc_13">
                <s>R$ 79,90/mês</s> agora incluído
              </p>
              <h3>Assistente de Live</h3>
              <p>
                O roteiro acompanha a live com cronômetro, o chat aparece ao lado com as perguntas
                de quem quer comprar já separadas, e a live infinita mantém seus clipes em loop
                com o produto fixado.
              </p>
              <a href="#live" className="_textLink_1pscc_30">
                Ver a live em ação
              </a>
            </article>
            <article className="reveal" data-reveal-delay="1">
              <p className="_wasPrice_1pscc_13">
                <s>R$ 39,90/mês</s> agora incluído
              </p>
              <h3>Raio-X de Vídeo</h3>
              <p>
                Cole o link de um vídeo que está vendendo. Você vê os números, o gancho e a
                estrutura do roteiro, tirados da fala real do vídeo, e recria essa estrutura para
                um produto seu.
              </p>
            </article>
          </div>
          <p className="_deliveryAnchor_1pscc_325 reveal">
            As duas eram assinaturas à parte: <strong>R$ 119,80 por mês, juntas</strong>. Agora
            fazem parte do acesso, nos dois planos, sem cobrança extra.
          </p>
          <div className="_studioList_1pscc_327 reveal">
            <h3>E o estúdio inteiro junto</h3>
            <dl>
              <div>
                <dt>Catálogo de produtos</dt>
                <dd>
                  Preço, comissão e o quanto cada venda paga, lado a lado, para escolher antes de
                  gravar.
                </dd>
              </div>
              <div>
                <dt>Radar de mudanças</dt>
                <dd>O que mudou de preço ou de comissão entre as leituras do catálogo.</dd>
              </div>
              <div>
                <dt>Influencers de IA e modelos</dt>
                <dd>
                  Crie seu personagem ou use os do estúdio, e reaproveite nas próximas ideias.
                </dd>
              </div>
              <div>
                <dt>Templates de vídeo e Trend AI</dt>
                <dd>Cenas com movimento definido e o que está em alta agora.</dd>
              </div>
              <div>
                <dt>Roteiros e prompts</dt>
                <dd>O roteiro escrito e o prompt pronto para colar no Flow ou no Veo.</dd>
              </div>
            </dl>
          </div>
        </section>

        <section
          className="_section_1pscc_137"
          aria-labelledby="proof-title"
          data-testimonials=""
          hidden
        >
          <div className="_sectionHeading_1pscc_139">
            <h2 id="proof-title">
              Quem já usa
              <br />a Zaalys.
            </h2>
            <p>Nas palavras de quem comprou.</p>
          </div>
          <div className="_testimonials_1pscc_356" data-testimonial-list="" />
        </section>

        <section id="acesso" className="_section_1pscc_137" aria-labelledby="access-title">
          <div className="_sectionHeading_1pscc_139 reveal">
            <h2 id="access-title">
              Dois jeitos
              <br />
              de começar.
            </h2>
            <p>
              As mesmas ferramentas nos dois planos. A diferença é só como você paga. Já tem
              acesso? <a href="/login">Entre na sua conta</a>.
            </p>
          </div>

          <div className="_plans_1pscc_336">
            <article className="_plan_1pscc_336 reveal">
              <header>
                <h3>Mensal</h3>
                <p>Para começar agora e parar quando quiser.</p>
              </header>
              <div className="_price_1pscc_341">
                <strong>
                  <span data-price-whole="monthly">R$ 540</span>
                  <span className="_priceCents_1pscc_345" data-price-fraction="monthly" />
                  <span className="_priceUnit_1pscc_343">/mês</span>
                </strong>
              </div>
              <a
                href="/checkout/vitalicio?plan=monthly&from=plans-monthly"
                className="_secondaryAction_1pscc_29"
              >
                Assinar o mensal
              </a>
              <p className="_guarantee_1pscc_351">
                <a href="/termos#arrependimento">
                  Veja as condições de cancelamento e reembolso.
                </a>
              </p>
              <ul className="_featureList_1pscc_311">
                <li>
                  <ArrowUpRight size={13} /> A live no automático, o estúdio inteiro e o Raio-X
                </li>
                <li>
                  <ArrowUpRight size={13} /> Cobrança mensal no Pix ou no cartão
                </li>
                <li>
                  <ArrowUpRight size={13} /> Sem fidelidade: o acesso segue até o fim do mês pago
                </li>
              </ul>
            </article>

            <article
              className="_plan_1pscc_336 _planFeatured_1pscc_338 reveal"
              data-reveal-delay="1"
            >
              <header>
                <h3>Vitalício</h3>
                <p>Paga uma vez. O acesso é seu, sem renovação.</p>
              </header>
              <div className="_price_1pscc_341">
                <strong>
                  <span className="_priceUnit_1pscc_343">
                    <span data-price="lifetime-count">12</span>x de
                  </span>{" "}
                  <span data-price-whole="lifetime-instalment">R$ 84</span>
                  <span
                    className="_priceCents_1pscc_345"
                    data-price-fraction="lifetime-instalment"
                  >
                    ,60
                  </span>
                </strong>
                <span className="_priceCash_1pscc_346">
                  ou <span data-price="lifetime">R$ 794</span> à vista
                </span>
              </div>
              <a
                href="/checkout/vitalicio?from=plans-lifetime"
                className="_primary_1pscc_28"
              >
                Comprar acesso vitalício
              </a>
              <p className="_guarantee_1pscc_351">
                <a href="/termos#arrependimento">
                  Veja as condições de cancelamento e reembolso.
                </a>
              </p>
              <ul className="_featureList_1pscc_311">
                <li>
                  <ArrowUpRight size={13} /> Tudo do mensal, sem mensalidade nenhuma
                </li>
                <li>
                  <ArrowUpRight size={13} /> Pagamento único, parcelável no cartão
                </li>
                <li>
                  <ArrowUpRight size={13} /> Custa menos que dois meses do plano mensal
                </li>
              </ul>
            </article>
          </div>

          <p className="_planNote_1pscc_348">
            Valores parcelados possuem acréscimo da operadora. Créditos de geração de vídeo em
            ferramentas externas, como Flow ou Veo, não estão incluídos. Consulte as condições de
            pagamento no checkout.
          </p>
        </section>

        <section
          id="radar"
          className="_section_1pscc_137 _radar_1pscc_117 reveal"
          aria-labelledby="radar-title"
        >
          <div>
            <h2 id="radar-title">
              Ainda não é a hora?
              <br />
              <span>Leve o Radar de graça.</span>
            </h2>
            <p>
              Toda segunda, por e-mail: os produtos do TikTok Shop que mais pagam por venda, com
              preço, comissão e o destaque da semana. Tirado do catálogo da Zaalys.
            </p>
          </div>
          <form method="post" action="/api/webhooks/leads" data-radar-form="">
            <label htmlFor="radar-email" className="_srOnly_1pscc_130">
              Seu e-mail
            </label>
            <input
              id="radar-email"
              name="email"
              type="email"
              inputMode="email"
              autoComplete="email"
              required
              placeholder="seu@email.com"
            />
            <input
              type="text"
              name="website"
              tabIndex={-1}
              autoComplete="off"
              className="_trap_1pscc_129"
              aria-hidden="true"
            />
            <input type="hidden" name="t" defaultValue="" data-rendered-at="" />
            <input type="hidden" name="source" defaultValue="landing-radar" />
            <button type="submit" className="_primary_1pscc_28">
              Quero o Radar
            </button>
            <p className="_radarNote_1pscc_125" data-radar-status="" role="status">
              Você confirma o e-mail com um clique e a primeira lista chega na hora. Sai da lista
              em um clique, em qualquer e-mail. <a href="/privacidade">Privacidade</a>.
            </p>
          </form>
        </section>

        <section
          className="_section_1pscc_137 _faq_1pscc_371"
          aria-labelledby="faq-title"
        >
          <h2 id="faq-title">Antes de começar.</h2>
          <dl className="_questions_1pscc_372">
            <div className="_question_1pscc_372 reveal">
              <dt>Preciso aparecer nos vídeos?</dt>
              <dd>
                Você pode criar um influencer de IA ou escolher um modelo do estúdio. Use esse
                personagem para preparar a imagem e o prompt do seu vídeo.
              </dd>
            </div>
            <div className="_question_1pscc_372 reveal">
              <dt>A Zaalys entrega o vídeo final?</dt>
              <dd>
                Na Zaalys, você prepara o personagem, o roteiro e o prompt de animação. Para
                renderizar o vídeo, leve o material para uma ferramenta como Flow ou Veo. O acesso
                e os créditos dessas ferramentas são separados.
              </dd>
            </div>
            <div className="_question_1pscc_372 reveal">
              <dt>Posso usar se estou começando no TikTok Shop?</dt>
              <dd>
                Sim. Você pode explorar produtos, comparar preço e comissão e preparar seu
                conteúdo. Para se afiliar aos produtos e publicar vídeos com links de compra, sua
                conta precisa atender aos requisitos do TikTok Shop.
              </dd>
            </div>
            <div className="_question_1pscc_372 reveal">
              <dt>Como funciona a live infinita?</dt>
              <dd>
                A extensão Zaalys Live, no Chrome do computador, usa seus clipes do produto como
                câmera e a narração como microfone. Ela comenta, fixa o produto, dá oi para quem
                entra e responde perguntas. Você ativa com a chave da sua conta, em um computador
                por vez.
              </dd>
            </div>
            <div className="_question_1pscc_372 reveal">
              <dt>Preciso de quê para fazer live com a Zaalys?</dt>
              <dd>
                Para apresentar com roteiro e chat, basta abrir a Zaalys em qualquer tela. Para a
                live infinita, um computador com Google Chrome e acesso à página de LIVE do TikTok
                Shop no navegador. Os clipes você gera no Google Flow, com créditos à parte.
              </dd>
            </div>
            <div className="_question_1pscc_372 reveal">
              <dt>Qual a diferença entre o mensal e o vitalício?</dt>
              <dd>
                As ferramentas são exatamente as mesmas nos dois. O mensal é cobrado todo mês e
                você para quando quiser; o vitalício é um pagamento único, parcelável, sem
                renovação.
              </dd>
            </div>
            <div className="_question_1pscc_372 reveal">
              <dt>O que está incluído no acesso?</dt>
              <dd>
                Nos dois planos: o catálogo de produtos, o radar de mudanças, os influencers de
                IA, os modelos e templates, o Trend AI, os roteiros e prompts, o Raio-X de Vídeo e
                o Assistente de Live. Nada é vendido à parte.
              </dd>
            </div>
            <div className="_question_1pscc_372 reveal">
              <dt>Como recebo meu acesso depois da compra?</dt>
              <dd>
                Após a confirmação do pagamento, siga as instruções do checkout para acessar ou
                criar sua conta com o mesmo e-mail usado na compra.
              </dd>
            </div>
            <div className="_question_1pscc_372 reveal">
              <dt>E se eu travar em alguma etapa?</dt>
              <dd>
                Escreva para suporte@zaalys.com ou responda qualquer e-mail nosso. Uma pessoa do
                time lê e responde, e cada ferramenta tem um passo a passo na própria tela.
              </dd>
            </div>
          </dl>
        </section>

        <section
          className="_section_1pscc_137 _closing_1pscc_364 reveal"
          aria-labelledby="closing-title"
        >
          <h2 id="closing-title">
            Escolha o produto.
            <br />
            <span>A live e o vídeo saem daqui.</span>
          </h2>
          <div className="_heroActions_1pscc_39">
            <a
              href="/checkout/vitalicio?from=closing-lifetime"
              className="_primary_1pscc_28"
            >
              Acesso vitalício{" "}
              <span>
                <span data-price="lifetime-count">12</span>x de{" "}
                <span data-price="lifetime-instalment">R$ 84,60</span>
              </span>{" "}
              <ArrowUpRight size={17} />
            </a>
            <a
              href="/checkout/vitalicio?plan=monthly&from=closing-monthly"
              className="_secondaryAction_1pscc_29"
            >
              Plano mensal{" "}
              <span>
                <span data-price="monthly">R$ 540</span>/mês
              </span>
            </a>
          </div>
          <p className="_guarantee_1pscc_351">
            <a href="/termos#arrependimento">
              Veja as condições de cancelamento e reembolso.
            </a>
          </p>
        </section>
      </main>

      <div className="_stickyCta_1pscc_91" data-sticky-cta="" hidden>
        <div>
          <strong>
            Vitalício <span data-price="lifetime-count">12</span>x de{" "}
            <span data-price="lifetime-instalment">R$ 84,60</span>
          </strong>
          <span>
            ou <span data-price="monthly">R$ 540</span>/mês · sem fidelidade
          </span>
        </div>
        <a href="#acesso" className="_primary_1pscc_28">
          Ver planos
        </a>
      </div>

      <footer className="_footer_1pscc_30 reveal">
        <p className="_footerSupport_1pscc_380">
          Para dúvidas, contate: <a href="mailto:suporte@zaalys.com">suporte@zaalys.com</a>
        </p>
        <AstroBrand mark={24} />
        <p>Zaalys é uma plataforma independente, sem vínculo com o TikTok.</p>
        <p className="_footerLegal_1pscc_385">
          <a href="/termos">Termos de Uso</a>
          <span aria-hidden="true">·</span>
          <a href="/privacidade">Política de Privacidade</a>
        </p>
        <a href="/login">Entrar na Zaalys</a>
      </footer>
    </div>
  );
}
