import React, { useEffect, useRef } from 'react';
import { useWalkthroughStore } from '@/store/walkthroughStore';
import { useLocation, useNavigate } from 'react-router-dom';
import { driver } from 'driver.js';
import 'driver.js/dist/driver.css';
import { useWalkthroughUIStore } from '@/store/zustandStores';

const driverObj = driver({
  allowClose: false,
  animate: true,
  nextBtnText: 'Next',
  prevBtnText: 'Back',
  doneBtnText: 'Done',
  allowKeyboardControl: true,
  showProgress: true,
});

export const WalkthroughController: React.FC = () => {
  const { steps, currentStep, isActive, activeTraining, next, back, skip, complete, trainingInstanceId } = useWalkthroughStore();
  const location = useLocation();
  const navigate = useNavigate();
  const prevStep = useRef<number>(-1);
  const pollingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const highlightTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastInstanceIdRef = useRef<number>(trainingInstanceId);

  useEffect(() => {
    // Cleanup polling on unmount or effect rerun
    return () => {
      if (pollingTimeoutRef.current) {
        clearTimeout(pollingTimeoutRef.current);
        pollingTimeoutRef.current = null;
      }
      if (highlightTimeoutRef.current) {
        clearTimeout(highlightTimeoutRef.current);
        highlightTimeoutRef.current = null;
      }
      driverObj.destroy();
    };
  }, []);

  useEffect(() => {
    if (!isActive || steps.length === 0) return;

    let animationFrame = 0;
    const refreshPopover = () => {
      if (animationFrame) cancelAnimationFrame(animationFrame);
      animationFrame = requestAnimationFrame(() => {
        driverObj.refresh();
        animationFrame = 0;
      });
    };

    window.addEventListener('scroll', refreshPopover, true);
    window.addEventListener('resize', refreshPopover);
    return () => {
      window.removeEventListener('scroll', refreshPopover, true);
      window.removeEventListener('resize', refreshPopover);
      if (animationFrame) cancelAnimationFrame(animationFrame);
    };
  }, [isActive, steps.length, currentStep]);

  useEffect(() => {
    // Always clear polling before starting new one
    if (pollingTimeoutRef.current) {
      clearTimeout(pollingTimeoutRef.current);
      pollingTimeoutRef.current = null;
    }
    if (highlightTimeoutRef.current) {
      clearTimeout(highlightTimeoutRef.current);
      highlightTimeoutRef.current = null;
    }
    driverObj.destroy();

    if (!isActive || steps.length === 0) {
      return;
    }

    const step = steps[currentStep];
    if (!step) return;

    lastInstanceIdRef.current = trainingInstanceId;

    console.log('[Walkthrough Debug] Current step:', currentStep, step.selector, 'isActive:', isActive, 'pathname:', location.pathname);

    // Only proceed if we're on the correct page
    if (step.page && step.page !== location.pathname) {
      console.log('[Walkthrough Debug] Not on correct page, navigating to:', step.page, 'Current:', location.pathname);
      navigate(step.page);
      // Do NOT start polling for the selector until the page is correct
      return;
    }

    // Only start polling for the selector when the page is correct
    const showStep = () => {
      // Defensive: Only continue if instanceId and step are still current
      if (!isActive || steps.length === 0 || lastInstanceIdRef.current !== trainingInstanceId) {
        return;
      }
      const el = document.querySelector(step.selector);
      console.log('[Walkthrough Debug] Looking for selector:', step.selector, 'Found:', !!el, 'On page:', location.pathname);
      if (el) {
        const bounds = el.getBoundingClientRect();
        const viewportMargin = 180;
        if (bounds.top < viewportMargin || bounds.bottom > window.innerHeight - viewportMargin) {
          el.scrollIntoView({ block: 'center', inline: 'nearest', behavior: 'auto' });
        }
        if (step.setCategory) {
          const categoryButton = Array.from(
            document.querySelectorAll<HTMLElement>("[data-walkthrough-category]"),
          ).find(
            (button) =>
              button.dataset.walkthroughCategory === step.setCategory,
          );
          const categoryValue = categoryButton?.dataset.categoryValue;
          if (categoryValue) {
            useWalkthroughUIStore.getState().setSelectedCategory(categoryValue);
          }
        }
        highlightTimeoutRef.current = setTimeout(() => {
          console.log('[Walkthrough Debug] showStep: highlighting selector:', step.selector);
          driverObj.highlight({
            element: step.selector,
            disableActiveInteraction:
              activeTraining === "order" &&
              step.selector !== ".quick-order-btn" &&
              step.selector !== ".table-btn" &&
              step.selector !== ".table-available" &&
              step.selector !== ".order-history-btn" &&
              step.selector !== ".team-chats-btn" &&
              step.selector !== ".settings-btn" &&
              step.selector !== ".profile-btn",
            ...(step.stageRadius !== undefined ? { stageRadius: step.stageRadius } : {}),
            ...(step.stagePadding !== undefined ? { stagePadding: step.stagePadding } : {}),
            popover: {
              title: '',
              description: typeof step.content === 'string' ? step.content : '',
              side: step.placement || 'bottom',
              align: step.align || 'start', // Pass align to driver.js
              popoverClass: 'driverjs-custom-popover',
              onNextClick: () => next(),
              onPrevClick: () => back(),
              onPopoverRender: (popover) => {
                popover.description.tabIndex = 0;
                popover.description.setAttribute('role', 'button');
                popover.description.setAttribute(
                  'aria-label',
                  'Continue walkthrough. Click, or press Enter or Space.',
                );
                popover.description.style.cursor = 'pointer';
                popover.description.onclick = () => next();
                popover.description.onkeydown = (event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    next();
                  }
                };
                popover.nextButton.focus({ preventScroll: true });
              }
            }
          });
        }, 100);
      } else {
        pollingTimeoutRef.current = setTimeout(showStep, 100);
      }
    };

    showStep();
    prevStep.current = currentStep;

    // Cleanup polling on effect rerun
    return () => {
      if (pollingTimeoutRef.current) {
        clearTimeout(pollingTimeoutRef.current);
        pollingTimeoutRef.current = null;
      }
      if (highlightTimeoutRef.current) {
        clearTimeout(highlightTimeoutRef.current);
        highlightTimeoutRef.current = null;
      }
      driverObj.destroy();
    };
  }, [steps, currentStep, isActive, location.pathname, next, back, skip, complete, navigate, trainingInstanceId]);

  useEffect(() => {
    if (!isActive || steps.length === 0) return;
    const step = steps[currentStep];
    if (step && step.onAdvance === 'autoCloseAndNavigateHome') {
      setTimeout(() => {
        useWalkthroughStore.getState().complete();
        navigate('/');
      }, 2000);
    }
  }, [steps, currentStep, isActive, navigate]);

  return null;
};