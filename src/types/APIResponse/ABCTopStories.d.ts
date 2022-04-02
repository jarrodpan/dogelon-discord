/* eslint-disable @typescript-eslint/no-empty-interface */
namespace APIResponse {
	export interface ABCTopStories {
		editions?: Edition[];
	}
	namespace ABCTopStories {
		export interface Edition {
			id?: string;
			contentUri?: string;
			items?: EditionItem[];
			major?: null;
			dataLayerPrepared?: DataLayerPrepared;
		}

		namespace Edition {
			export interface DataLayerPrepared {
				uri?: string;
				moduleUri?: string;
				contentSource?: string;
				contentType?: string;
				id?: string;
				title?: Title;
				items?: DataLayerPreparedItem[];
			}

			namespace DataLayerPrepared {
				export interface DataLayerPreparedItem {
					uri?: string;
				}

				export interface Title {
					title?: string;
				}
			}

			export interface EditionItem {
				contentLabelPrepared?: ContentLabelPrepared | null;
				imagePosition?: ImagePosition;
				imageContainerClassNames?: string[];
				headingClassNames?: string[];
				isMajor?: boolean;
				id?: string;
				cardImagePrepared?: CardImagePrepared;
				cardLinkPrepared?: CardLinkPrepared;
				contentUri?: string;
				cardVideoPrepared?: null;
				reactKey?: string;
				synopsis?: string;
				cardHeadingPrepared?: CardHeadingPrepared;
				liveBlogKeyEvents?: LiveBlogKeyEvent[];
			}

			namespace EditionItem {
				export interface CardHeadingPrepared {
					children?: string;
				}

				export interface CardImagePrepared {
					altText?: string;
					imgSrc?: string;
					imgRatio?: ImgRatio;
				}

				namespace CardImagePrepared {
					export enum ImgRatio {
						The16X9 = '16x9',
						The3X2 = '3x2',
					}
				}

				export interface CardLinkPrepared {
					to?: string;
				}

				export interface ContentLabelPrepared {
					labelText?: string;
				}

				export interface ImagePosition {
					mobile?: Mobile;
					tablet?: Desktop;
					desktop?: Desktop;
				}

				namespace ImagePosition {
					export enum Desktop {
						Left = 'left',
						Top = 'top',
					}

					export enum Mobile {
						Right = 'right',
						Top = 'top',
					}
				}

				export interface LiveBlogKeyEvent {
					liveBlogPostPrepared?: LiveBlogPostPrepared;
				}

				namespace LiveBlogKeyEvent {
					export interface LiveBlogPostPrepared {
						author?: Author;
						dateModified?: Date;
						datePublished?: Date;
						id?: string;
						url?: string;
						isComment?: boolean;
						isHidden?: boolean;
						isKeyEvent?: boolean;
						isPinned?: boolean;
						title?: string;
						type?: string;
						prepared?: Prepared;
					}

					namespace LiveBlogPostPrepared {
						export interface Author {
							id?: string;
							name?: string;
							avatar?: string;
						}

						export interface Prepared {
							descriptor?: Descriptor;
						}

						namespace Prepared {
							export interface Descriptor {
								type?: Type;
								key?: string;
								props?: DescriptorProps;
								children?: DescriptorChild[];
							}

							namespace Descriptor {
								export interface DescriptorChild {
									type?: Type;
									key?: Key;
									props?: PurpleProps;
									children?: PurpleChild[];
								}

								export interface DescriptorProps {}
								namespace DescriptorChild {
									export interface PurpleChild {
										type?: Type;
										content?: string;
										key?: string;
										props?: DescriptorProps;
										children?: FluffyChild[];
									}

									namespace PurpleChild {
										export interface FluffyChild {
											type?: Type;
											content?: string;
										}

										export enum Type {
											Tagname = 'tagname',
											Text = 'text',
										}

										export interface DescriptorProps {}
									}
									export interface PurpleProps {
										tagname?: Key;
										type?: string;
									}
									namespace PurpleProps {
										export enum Key {
											H2 = 'h2',
											P = 'p',
											Standfirst = '@@standfirst',
											UL = 'ul',
										}
									}
								}
							}
						}
					}
				}
			}
		}
	}
}
