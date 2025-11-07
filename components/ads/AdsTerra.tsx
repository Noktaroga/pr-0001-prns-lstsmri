import React, { useEffect, useRef } from 'react';

interface AdsTerraOverlayProps {
		width?: number;
		height?: number;
	}

	const ADS_TERRA_SCRIPT_SRC = '//pl28002511.effectivegatecpm.com/57/39/7f/57397f6987af8bed7f4425ed05c24076.js';

export const AdsTerraOverlay: React.FC<AdsTerraOverlayProps> = ({ width = 160, height = 600 }) => {
	const adRef = useRef<HTMLDivElement>(null);
	const scriptLoadedRef = useRef<boolean>(false);

	useEffect(() => {
		if (!adRef.current) return;

		// Calcular tamaño responsivo
		const maxWidth = typeof window !== 'undefined' ? Math.min(window.innerWidth - 32, width) : width;
		const responsiveWidth = Math.min(width, maxWidth);
		const aspectRatio = height / width;
		const responsiveHeight = Math.round(responsiveWidth * aspectRatio);

		// Limpiar el contenido anterior
		adRef.current.innerHTML = '';

		// Crear el contenedor del ad
		const adDiv = document.createElement('div');
		adDiv.id = 'adsterra-ad-container';
		adDiv.style.width = '100%';
		adDiv.style.height = responsiveHeight + 'px';
		adDiv.style.maxWidth = '100%';
		adRef.current.appendChild(adDiv);

		// Cargar el script de AdsTerra si no está cargado
		if (!scriptLoadedRef.current && !document.querySelector(`script[src*="${ADS_TERRA_SCRIPT_SRC}"]`)) {
			const script = document.createElement('script');
			script.type = 'text/javascript';
			script.async = true;
			script.src = ADS_TERRA_SCRIPT_SRC;
			script.onload = () => {
				scriptLoadedRef.current = true;
			};
			adDiv.appendChild(script);
		} else {
			// Si el script ya está cargado, intentar reiniciar el ad
			// No hay API pública, pero se puede limpiar y reinyectar si es necesario
		}

		// Cleanup function
		return () => {
			if (adRef.current) {
				adRef.current.innerHTML = '';
			}
		};
	}, [width, height]);

	return (
		<div
			ref={adRef}
			style={{
				width: Math.min(width, typeof window !== 'undefined' ? window.innerWidth - 32 : width),
				height: Math.round((Math.min(width, typeof window !== 'undefined' ? window.innerWidth - 32 : width)) * (height / width)),
				maxWidth: '100%',
				background: 'transparent'
			}}
			className="flex items-center justify-center rounded overflow-hidden"
		/>
	);
};
/**
 * Hook para inyectar el script de AdsTerra en un div por id
 * @param containerId id del div donde se inyectará el script
 */
export function useAdsTerraEffect(containerId: string) {
				useEffect(() => {
					if (!containerId) return;
					let attempts = 0;
					let timeoutId: ReturnType<typeof setTimeout>;
					const tryInjectScript = () => {
						const container = document.getElementById(containerId);
						if (container) {
							while (container.firstChild) container.removeChild(container.firstChild);
							const script = document.createElement('script');
							script.type = 'text/javascript';
							script.src = '//pl28002511.effectivegatecpm.com/57/39/7f/57397f6987af8bed7f4425ed05c24076.js';
							script.async = true;
							container.appendChild(script);
							// DEBUG: Log para verificar que el script se inyecta
							console.log('[AdsTerra] Script inyectado en', containerId);
						} else if (attempts < 10) {
							attempts++;
							timeoutId = setTimeout(tryInjectScript, 150);
						} else {
							console.warn('[AdsTerra] No se encontró el div', containerId);
						}
					};
					tryInjectScript();
					return () => {
						clearTimeout(timeoutId);
						const container = document.getElementById(containerId);
						if (container) while (container.firstChild) container.removeChild(container.firstChild);
					};
				}, [containerId]);
		}
