
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
  
  "public": {
          Tables: {
            "attribute_values": {
                  Row: {
                    "attribute_id": string,"created_at": string,"id": string,"is_active": boolean,"label": string,"label_ne": string | null,"sort_order": number,"swatch_hex": string | null,"updated_at": string,"value": string
                  }
                  ComputedFields: never
                  Insert: {
                    "attribute_id": string,"created_at"?: string,"id"?: string,"is_active"?: boolean,"label": string,"label_ne"?: string | null,"sort_order"?: number,"swatch_hex"?: string | null,"updated_at"?: string,"value": string
                  }
                  Update: {
                    "attribute_id"?: string,"created_at"?: string,"id"?: string,"is_active"?: boolean,"label"?: string,"label_ne"?: string | null,"sort_order"?: number,"swatch_hex"?: string | null,"updated_at"?: string,"value"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "attribute_values_attribute_id_fkey"
      columns: ["attribute_id"]
isOneToOne: false
      referencedRelation: "attributes"
      referencedColumns: ["id"]
    }
                  ]
                },"attributes": {
                  Row: {
                    "attribute_type": string,"code": string,"created_at": string,"id": string,"is_active": boolean,"is_filterable": boolean,"is_variant_defining": boolean,"name": string,"sort_order": number,"updated_at": string
                  }
                  ComputedFields: never
                  Insert: {
                    "attribute_type": string,"code": string,"created_at"?: string,"id"?: string,"is_active"?: boolean,"is_filterable"?: boolean,"is_variant_defining"?: boolean,"name": string,"sort_order"?: number,"updated_at"?: string
                  }
                  Update: {
                    "attribute_type"?: string,"code"?: string,"created_at"?: string,"id"?: string,"is_active"?: boolean,"is_filterable"?: boolean,"is_variant_defining"?: boolean,"name"?: string,"sort_order"?: number,"updated_at"?: string
                  }
                  Relationships: [
                    
                  ]
                },"audit_logs": {
                  Row: {
                    "action": string,"actor_type": string,"actor_user_id": string | null,"after_data": Json | null,"before_data": Json | null,"created_at": string,"entity_id": string | null,"entity_type": string,"id": string,"ip_hash": string | null,"reason": string | null,"request_id": string | null,"user_agent_summary": string | null
                  }
                  ComputedFields: never
                  Insert: {
                    "action": string,"actor_type": string,"actor_user_id"?: string | null,"after_data"?: Json | null,"before_data"?: Json | null,"created_at"?: string,"entity_id"?: string | null,"entity_type": string,"id"?: string,"ip_hash"?: string | null,"reason"?: string | null,"request_id"?: string | null,"user_agent_summary"?: string | null
                  }
                  Update: {
                    "action"?: string,"actor_type"?: string,"actor_user_id"?: string | null,"after_data"?: Json | null,"before_data"?: Json | null,"created_at"?: string,"entity_id"?: string | null,"entity_type"?: string,"id"?: string,"ip_hash"?: string | null,"reason"?: string | null,"request_id"?: string | null,"user_agent_summary"?: string | null
                  }
                  Relationships: [
                    
                  ]
                },"banner_translations": {
                  Row: {
                    "alt_text": string | null,"banner_id": string,"created_at": string,"cta_label": string | null,"headline": string | null,"id": string,"locale": string,"subheadline": string | null
                  }
                  ComputedFields: never
                  Insert: {
                    "alt_text"?: string | null,"banner_id": string,"created_at"?: string,"cta_label"?: string | null,"headline"?: string | null,"id"?: string,"locale": string,"subheadline"?: string | null
                  }
                  Update: {
                    "alt_text"?: string | null,"banner_id"?: string,"created_at"?: string,"cta_label"?: string | null,"headline"?: string | null,"id"?: string,"locale"?: string,"subheadline"?: string | null
                  }
                  Relationships: [
                    {
      foreignKeyName: "banner_translations_banner_id_fkey"
      columns: ["banner_id"]
isOneToOne: false
      referencedRelation: "banners"
      referencedColumns: ["id"]
    }
                  ]
                },"banners": {
                  Row: {
                    "created_at": string,"created_by": string | null,"ends_at": string | null,"id": string,"media_asset_id": string,"name": string,"placement": string,"sort_order": number,"starts_at": string | null,"status": string,"target_url": string | null,"updated_at": string
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string,"created_by"?: string | null,"ends_at"?: string | null,"id"?: string,"media_asset_id": string,"name": string,"placement": string,"sort_order"?: number,"starts_at"?: string | null,"status"?: string,"target_url"?: string | null,"updated_at"?: string
                  }
                  Update: {
                    "created_at"?: string,"created_by"?: string | null,"ends_at"?: string | null,"id"?: string,"media_asset_id"?: string,"name"?: string,"placement"?: string,"sort_order"?: number,"starts_at"?: string | null,"status"?: string,"target_url"?: string | null,"updated_at"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "banners_media_asset_id_fkey"
      columns: ["media_asset_id"]
isOneToOne: false
      referencedRelation: "media_assets"
      referencedColumns: ["id"]
    }
                  ]
                },"cart_items": {
                  Row: {
                    "cart_id": string,"created_at": string,"id": string,"product_id": string,"quantity": number,"updated_at": string,"variant_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "cart_id": string,"created_at"?: string,"id"?: string,"product_id": string,"quantity": number,"updated_at"?: string,"variant_id": string
                  }
                  Update: {
                    "cart_id"?: string,"created_at"?: string,"id"?: string,"product_id"?: string,"quantity"?: number,"updated_at"?: string,"variant_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "cart_items_cart_id_fkey"
      columns: ["cart_id"]
isOneToOne: false
      referencedRelation: "carts"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "cart_items_product_id_fkey"
      columns: ["product_id"]
isOneToOne: false
      referencedRelation: "products"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "cart_items_variant_id_fkey"
      columns: ["variant_id"]
isOneToOne: false
      referencedRelation: "product_variants"
      referencedColumns: ["id"]
    }
                  ]
                },"carts": {
                  Row: {
                    "created_at": string,"currency_code": string,"customer_id": string,"id": string,"last_activity_at": string | null,"status": string,"updated_at": string
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string,"currency_code"?: string,"customer_id": string,"id"?: string,"last_activity_at"?: string | null,"status"?: string,"updated_at"?: string
                  }
                  Update: {
                    "created_at"?: string,"currency_code"?: string,"customer_id"?: string,"id"?: string,"last_activity_at"?: string | null,"status"?: string,"updated_at"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "carts_customer_id_fkey"
      columns: ["customer_id"]
isOneToOne: true
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    }
                  ]
                },"categories": {
                  Row: {
                    "created_at": string,"deleted_at": string | null,"description": string | null,"id": string,"image_asset_id": string | null,"name": string,"parent_id": string | null,"published_at": string | null,"seo_description": string | null,"seo_title": string | null,"slug": string,"sort_order": number,"status": string,"updated_at": string
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string,"deleted_at"?: string | null,"description"?: string | null,"id"?: string,"image_asset_id"?: string | null,"name": string,"parent_id"?: string | null,"published_at"?: string | null,"seo_description"?: string | null,"seo_title"?: string | null,"slug": string,"sort_order"?: number,"status"?: string,"updated_at"?: string
                  }
                  Update: {
                    "created_at"?: string,"deleted_at"?: string | null,"description"?: string | null,"id"?: string,"image_asset_id"?: string | null,"name"?: string,"parent_id"?: string | null,"published_at"?: string | null,"seo_description"?: string | null,"seo_title"?: string | null,"slug"?: string,"sort_order"?: number,"status"?: string,"updated_at"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "categories_image_asset_id_fkey"
      columns: ["image_asset_id"]
isOneToOne: false
      referencedRelation: "media_assets"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "categories_parent_id_fkey"
      columns: ["parent_id"]
isOneToOne: false
      referencedRelation: "categories"
      referencedColumns: ["id"]
    }
                  ]
                },"category_translations": {
                  Row: {
                    "category_id": string,"created_at": string,"description": string | null,"id": string,"locale": string,"name": string,"seo_description": string | null,"seo_title": string | null
                  }
                  ComputedFields: never
                  Insert: {
                    "category_id": string,"created_at"?: string,"description"?: string | null,"id"?: string,"locale": string,"name": string,"seo_description"?: string | null,"seo_title"?: string | null
                  }
                  Update: {
                    "category_id"?: string,"created_at"?: string,"description"?: string | null,"id"?: string,"locale"?: string,"name"?: string,"seo_description"?: string | null,"seo_title"?: string | null
                  }
                  Relationships: [
                    {
      foreignKeyName: "category_translations_category_id_fkey"
      columns: ["category_id"]
isOneToOne: false
      referencedRelation: "categories"
      referencedColumns: ["id"]
    }
                  ]
                },"cms_page_sections": {
                  Row: {
                    "content": NonNullable<Json>,"created_at": string,"id": string,"is_enabled": boolean,"page_id": string,"section_key": string,"section_type": string,"sort_order": number,"updated_at": string
                  }
                  ComputedFields: never
                  Insert: {
                    "content"?: NonNullable<Json>,"created_at"?: string,"id"?: string,"is_enabled"?: boolean,"page_id": string,"section_key": string,"section_type": string,"sort_order"?: number,"updated_at"?: string
                  }
                  Update: {
                    "content"?: NonNullable<Json>,"created_at"?: string,"id"?: string,"is_enabled"?: boolean,"page_id"?: string,"section_key"?: string,"section_type"?: string,"sort_order"?: number,"updated_at"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "cms_page_sections_page_id_fkey"
      columns: ["page_id"]
isOneToOne: false
      referencedRelation: "cms_pages"
      referencedColumns: ["id"]
    }
                  ]
                },"cms_page_translations": {
                  Row: {
                    "created_at": string,"id": string,"locale": string,"page_id": string,"seo_description": string | null,"seo_title": string | null,"summary": string | null,"title": string
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string,"id"?: string,"locale": string,"page_id": string,"seo_description"?: string | null,"seo_title"?: string | null,"summary"?: string | null,"title": string
                  }
                  Update: {
                    "created_at"?: string,"id"?: string,"locale"?: string,"page_id"?: string,"seo_description"?: string | null,"seo_title"?: string | null,"summary"?: string | null,"title"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "cms_page_translations_page_id_fkey"
      columns: ["page_id"]
isOneToOne: false
      referencedRelation: "cms_pages"
      referencedColumns: ["id"]
    }
                  ]
                },"cms_pages": {
                  Row: {
                    "canonical_url": string | null,"created_at": string,"id": string,"page_type": string | null,"published_at": string | null,"seo_description": string | null,"seo_title": string | null,"slug": string,"status": string,"updated_at": string
                  }
                  ComputedFields: never
                  Insert: {
                    "canonical_url"?: string | null,"created_at"?: string,"id"?: string,"page_type"?: string | null,"published_at"?: string | null,"seo_description"?: string | null,"seo_title"?: string | null,"slug": string,"status"?: string,"updated_at"?: string
                  }
                  Update: {
                    "canonical_url"?: string | null,"created_at"?: string,"id"?: string,"page_type"?: string | null,"published_at"?: string | null,"seo_description"?: string | null,"seo_title"?: string | null,"slug"?: string,"status"?: string,"updated_at"?: string
                  }
                  Relationships: [
                    
                  ]
                },"collection_media": {
                  Row: {
                    "collection_id": string,"created_at": string,"id": string,"media_asset_id": string,"media_role": string | null,"sort_order": number
                  }
                  ComputedFields: never
                  Insert: {
                    "collection_id": string,"created_at"?: string,"id"?: string,"media_asset_id": string,"media_role"?: string | null,"sort_order"?: number
                  }
                  Update: {
                    "collection_id"?: string,"created_at"?: string,"id"?: string,"media_asset_id"?: string,"media_role"?: string | null,"sort_order"?: number
                  }
                  Relationships: [
                    {
      foreignKeyName: "collection_media_collection_id_fkey"
      columns: ["collection_id"]
isOneToOne: false
      referencedRelation: "collections"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "collection_media_media_asset_id_fkey"
      columns: ["media_asset_id"]
isOneToOne: false
      referencedRelation: "media_assets"
      referencedColumns: ["id"]
    }
                  ]
                },"collection_products": {
                  Row: {
                    "added_at": string,"collection_id": string,"product_id": string,"sort_order": number
                  }
                  ComputedFields: never
                  Insert: {
                    "added_at"?: string,"collection_id": string,"product_id": string,"sort_order"?: number
                  }
                  Update: {
                    "added_at"?: string,"collection_id"?: string,"product_id"?: string,"sort_order"?: number
                  }
                  Relationships: [
                    {
      foreignKeyName: "collection_products_collection_id_fkey"
      columns: ["collection_id"]
isOneToOne: false
      referencedRelation: "collections"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "collection_products_product_id_fkey"
      columns: ["product_id"]
isOneToOne: false
      referencedRelation: "products"
      referencedColumns: ["id"]
    }
                  ]
                },"collection_translations": {
                  Row: {
                    "collection_id": string,"created_at": string,"description": string | null,"id": string,"locale": string,"name": string,"seo_description": string | null,"seo_title": string | null
                  }
                  ComputedFields: never
                  Insert: {
                    "collection_id": string,"created_at"?: string,"description"?: string | null,"id"?: string,"locale": string,"name": string,"seo_description"?: string | null,"seo_title"?: string | null
                  }
                  Update: {
                    "collection_id"?: string,"created_at"?: string,"description"?: string | null,"id"?: string,"locale"?: string,"name"?: string,"seo_description"?: string | null,"seo_title"?: string | null
                  }
                  Relationships: [
                    {
      foreignKeyName: "collection_translations_collection_id_fkey"
      columns: ["collection_id"]
isOneToOne: false
      referencedRelation: "collections"
      referencedColumns: ["id"]
    }
                  ]
                },"collections": {
                  Row: {
                    "collection_type": string,"created_at": string,"deleted_at": string | null,"description": string | null,"ends_at": string | null,"hero_media_id": string | null,"id": string,"name": string,"published_at": string | null,"seo_description": string | null,"seo_title": string | null,"slug": string,"sort_order": number,"starts_at": string | null,"status": string,"updated_at": string
                  }
                  ComputedFields: never
                  Insert: {
                    "collection_type": string,"created_at"?: string,"deleted_at"?: string | null,"description"?: string | null,"ends_at"?: string | null,"hero_media_id"?: string | null,"id"?: string,"name": string,"published_at"?: string | null,"seo_description"?: string | null,"seo_title"?: string | null,"slug": string,"sort_order"?: number,"starts_at"?: string | null,"status"?: string,"updated_at"?: string
                  }
                  Update: {
                    "collection_type"?: string,"created_at"?: string,"deleted_at"?: string | null,"description"?: string | null,"ends_at"?: string | null,"hero_media_id"?: string | null,"id"?: string,"name"?: string,"published_at"?: string | null,"seo_description"?: string | null,"seo_title"?: string | null,"slug"?: string,"sort_order"?: number,"starts_at"?: string | null,"status"?: string,"updated_at"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "collections_hero_media_id_fkey"
      columns: ["hero_media_id"]
isOneToOne: false
      referencedRelation: "media_assets"
      referencedColumns: ["id"]
    }
                  ]
                },"coupon_redemptions": {
                  Row: {
                    "coupon_id": string,"created_at": string,"customer_id": string | null,"discount_amount": number,"guest_identity_hash": string | null,"id": string,"order_id": string,"redeemed_at": string | null,"status": string
                  }
                  ComputedFields: never
                  Insert: {
                    "coupon_id": string,"created_at"?: string,"customer_id"?: string | null,"discount_amount": number,"guest_identity_hash"?: string | null,"id"?: string,"order_id": string,"redeemed_at"?: string | null,"status": string
                  }
                  Update: {
                    "coupon_id"?: string,"created_at"?: string,"customer_id"?: string | null,"discount_amount"?: number,"guest_identity_hash"?: string | null,"id"?: string,"order_id"?: string,"redeemed_at"?: string | null,"status"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "coupon_redemptions_coupon_id_fkey"
      columns: ["coupon_id"]
isOneToOne: false
      referencedRelation: "coupons"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "coupon_redemptions_customer_id_fkey"
      columns: ["customer_id"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "coupon_redemptions_order_id_fkey"
      columns: ["order_id"]
isOneToOne: false
      referencedRelation: "orders"
      referencedColumns: ["id"]
    }
                  ]
                },"coupons": {
                  Row: {
                    "code": string,"created_at": string,"ends_at": string | null,"id": string,"per_customer_limit": number | null,"promotion_id": string,"starts_at": string | null,"status": string,"total_redemption_limit": number | null,"updated_at": string
                  }
                  ComputedFields: never
                  Insert: {
                    "code": string,"created_at"?: string,"ends_at"?: string | null,"id"?: string,"per_customer_limit"?: number | null,"promotion_id": string,"starts_at"?: string | null,"status"?: string,"total_redemption_limit"?: number | null,"updated_at"?: string
                  }
                  Update: {
                    "code"?: string,"created_at"?: string,"ends_at"?: string | null,"id"?: string,"per_customer_limit"?: number | null,"promotion_id"?: string,"starts_at"?: string | null,"status"?: string,"total_redemption_limit"?: number | null,"updated_at"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "coupons_promotion_id_fkey"
      columns: ["promotion_id"]
isOneToOne: false
      referencedRelation: "promotions"
      referencedColumns: ["id"]
    }
                  ]
                },"couriers": {
                  Row: {
                    "code": string,"contact_details": NonNullable<Json>,"created_at": string,"id": string,"integration_provider_id": string | null,"is_active": boolean,"name": string,"tracking_url_template": string | null,"updated_at": string
                  }
                  ComputedFields: never
                  Insert: {
                    "code": string,"contact_details"?: NonNullable<Json>,"created_at"?: string,"id"?: string,"integration_provider_id"?: string | null,"is_active"?: boolean,"name": string,"tracking_url_template"?: string | null,"updated_at"?: string
                  }
                  Update: {
                    "code"?: string,"contact_details"?: NonNullable<Json>,"created_at"?: string,"id"?: string,"integration_provider_id"?: string | null,"is_active"?: boolean,"name"?: string,"tracking_url_template"?: string | null,"updated_at"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "couriers_integration_provider_fk"
      columns: ["integration_provider_id"]
isOneToOne: false
      referencedRelation: "integration_providers"
      referencedColumns: ["id"]
    }
                  ]
                },"customer_addresses": {
                  Row: {
                    "created_at": string,"customer_id": string,"deleted_at": string | null,"delivery_instructions": string | null,"district_id": string,"house_number": string | null,"id": string,"is_default": boolean,"label": string | null,"landmark": string | null,"municipality_id": string,"province_id": string,"recipient_name": string,"recipient_phone_e164": string,"street_address": string,"updated_at": string,"ward_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string,"customer_id": string,"deleted_at"?: string | null,"delivery_instructions"?: string | null,"district_id": string,"house_number"?: string | null,"id"?: string,"is_default"?: boolean,"label"?: string | null,"landmark"?: string | null,"municipality_id": string,"province_id": string,"recipient_name": string,"recipient_phone_e164": string,"street_address": string,"updated_at"?: string,"ward_id": string
                  }
                  Update: {
                    "created_at"?: string,"customer_id"?: string,"deleted_at"?: string | null,"delivery_instructions"?: string | null,"district_id"?: string,"house_number"?: string | null,"id"?: string,"is_default"?: boolean,"label"?: string | null,"landmark"?: string | null,"municipality_id"?: string,"province_id"?: string,"recipient_name"?: string,"recipient_phone_e164"?: string,"street_address"?: string,"updated_at"?: string,"ward_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "customer_addresses_customer_id_fkey"
      columns: ["customer_id"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "customer_addresses_district_id_province_id_fkey"
      columns: ["district_id","province_id"]
isOneToOne: false
      referencedRelation: "districts"
      referencedColumns: ["id","province_id"]
    },{
      foreignKeyName: "customer_addresses_municipality_id_district_id_fkey"
      columns: ["municipality_id","district_id"]
isOneToOne: false
      referencedRelation: "municipalities"
      referencedColumns: ["id","district_id"]
    },{
      foreignKeyName: "customer_addresses_province_id_fkey"
      columns: ["province_id"]
isOneToOne: false
      referencedRelation: "provinces"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "customer_addresses_ward_id_municipality_id_fkey"
      columns: ["ward_id","municipality_id"]
isOneToOne: false
      referencedRelation: "wards"
      referencedColumns: ["id","municipality_id"]
    }
                  ]
                },"customer_events": {
                  Row: {
                    "created_at": string,"customer_id": string | null,"entity_id": string | null,"entity_type": string | null,"event_data": NonNullable<Json>,"event_type": string,"guest_session_hash": string | null,"id": string,"occurred_at": string
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string,"customer_id"?: string | null,"entity_id"?: string | null,"entity_type"?: string | null,"event_data"?: NonNullable<Json>,"event_type": string,"guest_session_hash"?: string | null,"id"?: string,"occurred_at": string
                  }
                  Update: {
                    "created_at"?: string,"customer_id"?: string | null,"entity_id"?: string | null,"entity_type"?: string | null,"event_data"?: NonNullable<Json>,"event_type"?: string,"guest_session_hash"?: string | null,"id"?: string,"occurred_at"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "customer_events_customer_id_fkey"
      columns: ["customer_id"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    }
                  ]
                },"customer_notification_preferences": {
                  Row: {
                    "channel": string,"customer_id": string,"id": string,"marketing_enabled": boolean,"transactional_enabled": boolean,"updated_at": string
                  }
                  ComputedFields: never
                  Insert: {
                    "channel": string,"customer_id": string,"id"?: string,"marketing_enabled"?: boolean,"transactional_enabled"?: boolean,"updated_at"?: string
                  }
                  Update: {
                    "channel"?: string,"customer_id"?: string,"id"?: string,"marketing_enabled"?: boolean,"transactional_enabled"?: boolean,"updated_at"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "customer_notification_preferences_customer_id_fkey"
      columns: ["customer_id"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    }
                  ]
                },"customer_search_history": {
                  Row: {
                    "created_at": string,"customer_id": string | null,"guest_session_hash": string | null,"id": string,"locale": string | null,"query_text": string,"searched_at": string
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string,"customer_id"?: string | null,"guest_session_hash"?: string | null,"id"?: string,"locale"?: string | null,"query_text": string,"searched_at": string
                  }
                  Update: {
                    "created_at"?: string,"customer_id"?: string | null,"guest_session_hash"?: string | null,"id"?: string,"locale"?: string | null,"query_text"?: string,"searched_at"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "customer_search_history_customer_id_fkey"
      columns: ["customer_id"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    }
                  ]
                },"districts": {
                  Row: {
                    "code": string,"created_at": string,"id": string,"is_active": boolean,"name_en": string,"name_ne": string | null,"province_id": string,"updated_at": string
                  }
                  ComputedFields: never
                  Insert: {
                    "code": string,"created_at"?: string,"id"?: string,"is_active"?: boolean,"name_en": string,"name_ne"?: string | null,"province_id": string,"updated_at"?: string
                  }
                  Update: {
                    "code"?: string,"created_at"?: string,"id"?: string,"is_active"?: boolean,"name_en"?: string,"name_ne"?: string | null,"province_id"?: string,"updated_at"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "districts_province_id_fkey"
      columns: ["province_id"]
isOneToOne: false
      referencedRelation: "provinces"
      referencedColumns: ["id"]
    }
                  ]
                },"exchange_items": {
                  Row: {
                    "approved_variant_id": string | null,"created_at": string,"id": string,"price_difference": number,"quantity": number,"requested_variant_id": string | null,"return_request_item_id": string,"status": string,"updated_at": string
                  }
                  ComputedFields: never
                  Insert: {
                    "approved_variant_id"?: string | null,"created_at"?: string,"id"?: string,"price_difference"?: number,"quantity": number,"requested_variant_id"?: string | null,"return_request_item_id": string,"status"?: string,"updated_at"?: string
                  }
                  Update: {
                    "approved_variant_id"?: string | null,"created_at"?: string,"id"?: string,"price_difference"?: number,"quantity"?: number,"requested_variant_id"?: string | null,"return_request_item_id"?: string,"status"?: string,"updated_at"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "exchange_items_approved_variant_id_fkey"
      columns: ["approved_variant_id"]
isOneToOne: false
      referencedRelation: "product_variants"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "exchange_items_requested_variant_id_fkey"
      columns: ["requested_variant_id"]
isOneToOne: false
      referencedRelation: "product_variants"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "exchange_items_return_request_item_id_fkey"
      columns: ["return_request_item_id"]
isOneToOne: false
      referencedRelation: "return_request_items"
      referencedColumns: ["id"]
    }
                  ]
                },"faq_categories": {
                  Row: {
                    "created_at": string,"id": string,"name": string,"slug": string,"sort_order": number,"status": string,"updated_at": string
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string,"id"?: string,"name": string,"slug": string,"sort_order"?: number,"status"?: string,"updated_at"?: string
                  }
                  Update: {
                    "created_at"?: string,"id"?: string,"name"?: string,"slug"?: string,"sort_order"?: number,"status"?: string,"updated_at"?: string
                  }
                  Relationships: [
                    
                  ]
                },"faq_entries": {
                  Row: {
                    "created_at": string,"faq_category_id": string | null,"faq_key": string,"id": string,"sort_order": number,"status": string,"updated_at": string
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string,"faq_category_id"?: string | null,"faq_key": string,"id"?: string,"sort_order"?: number,"status"?: string,"updated_at"?: string
                  }
                  Update: {
                    "created_at"?: string,"faq_category_id"?: string | null,"faq_key"?: string,"id"?: string,"sort_order"?: number,"status"?: string,"updated_at"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "faq_entries_faq_category_id_fkey"
      columns: ["faq_category_id"]
isOneToOne: false
      referencedRelation: "faq_categories"
      referencedColumns: ["id"]
    }
                  ]
                },"faq_translations": {
                  Row: {
                    "answer": string,"created_at": string,"faq_entry_id": string,"id": string,"locale": string,"question": string
                  }
                  ComputedFields: never
                  Insert: {
                    "answer": string,"created_at"?: string,"faq_entry_id": string,"id"?: string,"locale": string,"question": string
                  }
                  Update: {
                    "answer"?: string,"created_at"?: string,"faq_entry_id"?: string,"id"?: string,"locale"?: string,"question"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "faq_translations_faq_entry_id_fkey"
      columns: ["faq_entry_id"]
isOneToOne: false
      referencedRelation: "faq_entries"
      referencedColumns: ["id"]
    }
                  ]
                },"guest_order_access_challenges": {
                  Row: {
                    "attempt_count": number,"challenge_hash": string,"consumed_at": string | null,"created_at": string,"expires_at": string,"id": string,"order_id": string,"phone_hash": string,"verified_at": string | null
                  }
                  ComputedFields: never
                  Insert: {
                    "attempt_count"?: number,"challenge_hash": string,"consumed_at"?: string | null,"created_at"?: string,"expires_at": string,"id"?: string,"order_id": string,"phone_hash": string,"verified_at"?: string | null
                  }
                  Update: {
                    "attempt_count"?: number,"challenge_hash"?: string,"consumed_at"?: string | null,"created_at"?: string,"expires_at"?: string,"id"?: string,"order_id"?: string,"phone_hash"?: string,"verified_at"?: string | null
                  }
                  Relationships: [
                    {
      foreignKeyName: "guest_order_access_challenges_order_id_fkey"
      columns: ["order_id"]
isOneToOne: false
      referencedRelation: "orders"
      referencedColumns: ["id"]
    }
                  ]
                },"integration_providers": {
                  Row: {
                    "code": string,"created_at": string,"display_name": string,"id": string,"provider_type": string,"public_configuration": NonNullable<Json>,"status": string,"updated_at": string
                  }
                  ComputedFields: never
                  Insert: {
                    "code": string,"created_at"?: string,"display_name": string,"id"?: string,"provider_type": string,"public_configuration"?: NonNullable<Json>,"status"?: string,"updated_at"?: string
                  }
                  Update: {
                    "code"?: string,"created_at"?: string,"display_name"?: string,"id"?: string,"provider_type"?: string,"public_configuration"?: NonNullable<Json>,"status"?: string,"updated_at"?: string
                  }
                  Relationships: [
                    
                  ]
                },"inventory_adjustment_items": {
                  Row: {
                    "adjustment_id": string,"counted_quantity": number | null,"created_at": string,"id": string,"quantity_delta": number,"variant_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "adjustment_id": string,"counted_quantity"?: number | null,"created_at"?: string,"id"?: string,"quantity_delta": number,"variant_id": string
                  }
                  Update: {
                    "adjustment_id"?: string,"counted_quantity"?: number | null,"created_at"?: string,"id"?: string,"quantity_delta"?: number,"variant_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "inventory_adjustment_items_adjustment_id_fkey"
      columns: ["adjustment_id"]
isOneToOne: false
      referencedRelation: "inventory_adjustments"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "inventory_adjustment_items_variant_id_fkey"
      columns: ["variant_id"]
isOneToOne: false
      referencedRelation: "product_variants"
      referencedColumns: ["id"]
    }
                  ]
                },"inventory_adjustments": {
                  Row: {
                    "adjustment_reference": string,"created_at": string,"created_by": string,"id": string,"location_id": string,"posted_at": string | null,"reason": string,"reason_code": string,"status": string,"updated_at": string
                  }
                  ComputedFields: never
                  Insert: {
                    "adjustment_reference": string,"created_at"?: string,"created_by": string,"id"?: string,"location_id": string,"posted_at"?: string | null,"reason": string,"reason_code": string,"status"?: string,"updated_at"?: string
                  }
                  Update: {
                    "adjustment_reference"?: string,"created_at"?: string,"created_by"?: string,"id"?: string,"location_id"?: string,"posted_at"?: string | null,"reason"?: string,"reason_code"?: string,"status"?: string,"updated_at"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "inventory_adjustments_location_id_fkey"
      columns: ["location_id"]
isOneToOne: false
      referencedRelation: "inventory_locations"
      referencedColumns: ["id"]
    }
                  ]
                },"inventory_levels": {
                  Row: {
                    "created_at": string,"id": string,"location_id": string,"on_hand_quantity": number,"updated_at": string,"variant_id": string,"version": number
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string,"id"?: string,"location_id": string,"on_hand_quantity"?: number,"updated_at"?: string,"variant_id": string,"version"?: number
                  }
                  Update: {
                    "created_at"?: string,"id"?: string,"location_id"?: string,"on_hand_quantity"?: number,"updated_at"?: string,"variant_id"?: string,"version"?: number
                  }
                  Relationships: [
                    {
      foreignKeyName: "inventory_levels_location_id_fkey"
      columns: ["location_id"]
isOneToOne: false
      referencedRelation: "inventory_locations"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "inventory_levels_variant_id_fkey"
      columns: ["variant_id"]
isOneToOne: false
      referencedRelation: "product_variants"
      referencedColumns: ["id"]
    }
                  ]
                },"inventory_locations": {
                  Row: {
                    "address_text": string | null,"code": string,"created_at": string,"id": string,"is_active": boolean,"location_type": string,"name": string,"updated_at": string
                  }
                  ComputedFields: never
                  Insert: {
                    "address_text"?: string | null,"code": string,"created_at"?: string,"id"?: string,"is_active"?: boolean,"location_type": string,"name": string,"updated_at"?: string
                  }
                  Update: {
                    "address_text"?: string | null,"code"?: string,"created_at"?: string,"id"?: string,"is_active"?: boolean,"location_type"?: string,"name"?: string,"updated_at"?: string
                  }
                  Relationships: [
                    
                  ]
                },"inventory_movements": {
                  Row: {
                    "actor_user_id": string | null,"adjustment_item_id": string | null,"created_at": string,"id": string,"inventory_level_id": string,"location_id": string,"movement_type": string,"on_hand_delta": number,"order_item_id": string | null,"reason": string | null,"reservation_item_id": string | null,"reserved_delta": number,"return_inspection_id": string | null,"transfer_id": string | null,"variant_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "actor_user_id"?: string | null,"adjustment_item_id"?: string | null,"created_at"?: string,"id"?: string,"inventory_level_id": string,"location_id": string,"movement_type": string,"on_hand_delta"?: number,"order_item_id"?: string | null,"reason"?: string | null,"reservation_item_id"?: string | null,"reserved_delta"?: number,"return_inspection_id"?: string | null,"transfer_id"?: string | null,"variant_id": string
                  }
                  Update: {
                    "actor_user_id"?: string | null,"adjustment_item_id"?: string | null,"created_at"?: string,"id"?: string,"inventory_level_id"?: string,"location_id"?: string,"movement_type"?: string,"on_hand_delta"?: number,"order_item_id"?: string | null,"reason"?: string | null,"reservation_item_id"?: string | null,"reserved_delta"?: number,"return_inspection_id"?: string | null,"transfer_id"?: string | null,"variant_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "inventory_movements_adjustment_item_id_fkey"
      columns: ["adjustment_item_id"]
isOneToOne: false
      referencedRelation: "inventory_adjustment_items"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "inventory_movements_inventory_level_id_variant_id_location_fkey"
      columns: ["inventory_level_id","variant_id","location_id"]
isOneToOne: false
      referencedRelation: "inventory_levels"
      referencedColumns: ["id","variant_id","location_id"]
    },{
      foreignKeyName: "inventory_movements_inventory_level_id_variant_id_location_fkey"
      columns: ["inventory_level_id","variant_id","location_id"]
isOneToOne: false
      referencedRelation: "v_inventory_availability"
      referencedColumns: ["inventory_level_id","variant_id","location_id"]
    },{
      foreignKeyName: "inventory_movements_location_id_fkey"
      columns: ["location_id"]
isOneToOne: false
      referencedRelation: "inventory_locations"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "inventory_movements_order_item_id_fkey"
      columns: ["order_item_id"]
isOneToOne: false
      referencedRelation: "order_items"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "inventory_movements_reservation_item_id_fkey"
      columns: ["reservation_item_id"]
isOneToOne: false
      referencedRelation: "stock_reservation_items"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "inventory_movements_return_inspection_id_fkey"
      columns: ["return_inspection_id"]
isOneToOne: false
      referencedRelation: "return_inspections"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "inventory_movements_transfer_id_fkey"
      columns: ["transfer_id"]
isOneToOne: false
      referencedRelation: "inventory_transfers"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "inventory_movements_variant_id_fkey"
      columns: ["variant_id"]
isOneToOne: false
      referencedRelation: "product_variants"
      referencedColumns: ["id"]
    }
                  ]
                },"inventory_transfer_items": {
                  Row: {
                    "created_at": string,"id": string,"quantity": number,"transfer_id": string,"variant_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string,"id"?: string,"quantity": number,"transfer_id": string,"variant_id": string
                  }
                  Update: {
                    "created_at"?: string,"id"?: string,"quantity"?: number,"transfer_id"?: string,"variant_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "inventory_transfer_items_transfer_id_fkey"
      columns: ["transfer_id"]
isOneToOne: false
      referencedRelation: "inventory_transfers"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "inventory_transfer_items_variant_id_fkey"
      columns: ["variant_id"]
isOneToOne: false
      referencedRelation: "product_variants"
      referencedColumns: ["id"]
    }
                  ]
                },"inventory_transfers": {
                  Row: {
                    "created_at": string,"created_by": string,"from_location_id": string,"id": string,"posted_at": string | null,"reason": string,"status": string,"to_location_id": string,"transfer_reference": string,"updated_at": string
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string,"created_by": string,"from_location_id": string,"id"?: string,"posted_at"?: string | null,"reason": string,"status"?: string,"to_location_id": string,"transfer_reference": string,"updated_at"?: string
                  }
                  Update: {
                    "created_at"?: string,"created_by"?: string,"from_location_id"?: string,"id"?: string,"posted_at"?: string | null,"reason"?: string,"status"?: string,"to_location_id"?: string,"transfer_reference"?: string,"updated_at"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "inventory_transfers_from_location_id_fkey"
      columns: ["from_location_id"]
isOneToOne: false
      referencedRelation: "inventory_locations"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "inventory_transfers_to_location_id_fkey"
      columns: ["to_location_id"]
isOneToOne: false
      referencedRelation: "inventory_locations"
      referencedColumns: ["id"]
    }
                  ]
                },"media_assets": {
                  Row: {
                    "alt_text": string | null,"alt_text_ne": string | null,"bucket_name": string | null,"bytes": number | null,"created_at": string,"created_by": string | null,"format": string | null,"height": number | null,"id": string,"mime_type": string | null,"object_path": string | null,"provider": string,"provider_asset_id": string,"public_url": string | null,"storage_visibility": string,"updated_at": string,"width": number | null
                  }
                  ComputedFields: never
                  Insert: {
                    "alt_text"?: string | null,"alt_text_ne"?: string | null,"bucket_name"?: string | null,"bytes"?: number | null,"created_at"?: string,"created_by"?: string | null,"format"?: string | null,"height"?: number | null,"id"?: string,"mime_type"?: string | null,"object_path"?: string | null,"provider": string,"provider_asset_id": string,"public_url"?: string | null,"storage_visibility": string,"updated_at"?: string,"width"?: number | null
                  }
                  Update: {
                    "alt_text"?: string | null,"alt_text_ne"?: string | null,"bucket_name"?: string | null,"bytes"?: number | null,"created_at"?: string,"created_by"?: string | null,"format"?: string | null,"height"?: number | null,"id"?: string,"mime_type"?: string | null,"object_path"?: string | null,"provider"?: string,"provider_asset_id"?: string,"public_url"?: string | null,"storage_visibility"?: string,"updated_at"?: string,"width"?: number | null
                  }
                  Relationships: [
                    
                  ]
                },"municipalities": {
                  Row: {
                    "code": string,"created_at": string,"district_id": string,"id": string,"is_active": boolean,"municipality_type": string,"name_en": string,"name_ne": string | null,"updated_at": string
                  }
                  ComputedFields: never
                  Insert: {
                    "code": string,"created_at"?: string,"district_id": string,"id"?: string,"is_active"?: boolean,"municipality_type": string,"name_en": string,"name_ne"?: string | null,"updated_at"?: string
                  }
                  Update: {
                    "code"?: string,"created_at"?: string,"district_id"?: string,"id"?: string,"is_active"?: boolean,"municipality_type"?: string,"name_en"?: string,"name_ne"?: string | null,"updated_at"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "municipalities_district_id_fkey"
      columns: ["district_id"]
isOneToOne: false
      referencedRelation: "districts"
      referencedColumns: ["id"]
    }
                  ]
                },"notification_deliveries": {
                  Row: {
                    "attempt_number": number,"attempted_at": string | null,"completed_at": string | null,"created_at": string,"error_code": string | null,"error_message_safe": string | null,"id": string,"notification_id": string,"provider_code": string | null,"provider_message_id": string | null,"status": string
                  }
                  ComputedFields: never
                  Insert: {
                    "attempt_number": number,"attempted_at"?: string | null,"completed_at"?: string | null,"created_at"?: string,"error_code"?: string | null,"error_message_safe"?: string | null,"id"?: string,"notification_id": string,"provider_code"?: string | null,"provider_message_id"?: string | null,"status": string
                  }
                  Update: {
                    "attempt_number"?: number,"attempted_at"?: string | null,"completed_at"?: string | null,"created_at"?: string,"error_code"?: string | null,"error_message_safe"?: string | null,"id"?: string,"notification_id"?: string,"provider_code"?: string | null,"provider_message_id"?: string | null,"status"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "notification_deliveries_notification_id_fkey"
      columns: ["notification_id"]
isOneToOne: false
      referencedRelation: "notifications"
      referencedColumns: ["id"]
    }
                  ]
                },"notification_events": {
                  Row: {
                    "created_at": string,"customer_id": string | null,"entity_id": string,"entity_type": string,"event_payload": NonNullable<Json>,"event_type": string,"id": string,"idempotency_key": string,"occurred_at": string
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string,"customer_id"?: string | null,"entity_id": string,"entity_type": string,"event_payload"?: NonNullable<Json>,"event_type": string,"id"?: string,"idempotency_key": string,"occurred_at"?: string
                  }
                  Update: {
                    "created_at"?: string,"customer_id"?: string | null,"entity_id"?: string,"entity_type"?: string,"event_payload"?: NonNullable<Json>,"event_type"?: string,"id"?: string,"idempotency_key"?: string,"occurred_at"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "notification_events_customer_id_fkey"
      columns: ["customer_id"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    }
                  ]
                },"notification_templates": {
                  Row: {
                    "body_template": string,"channel": string,"code": string,"created_at": string,"event_type": string,"id": string,"is_active": boolean,"locale": string,"provider_template_id": string | null,"subject": string | null,"updated_at": string
                  }
                  ComputedFields: never
                  Insert: {
                    "body_template": string,"channel": string,"code": string,"created_at"?: string,"event_type": string,"id"?: string,"is_active"?: boolean,"locale": string,"provider_template_id"?: string | null,"subject"?: string | null,"updated_at"?: string
                  }
                  Update: {
                    "body_template"?: string,"channel"?: string,"code"?: string,"created_at"?: string,"event_type"?: string,"id"?: string,"is_active"?: boolean,"locale"?: string,"provider_template_id"?: string | null,"subject"?: string | null,"updated_at"?: string
                  }
                  Relationships: [
                    
                  ]
                },"notifications": {
                  Row: {
                    "body_snapshot": string | null,"channel": string,"created_at": string,"customer_id": string | null,"id": string,"notification_event_id": string | null,"order_id": string | null,"read_at": string | null,"recipient_snapshot": string | null,"status": string,"subject_snapshot": string | null,"template_id": string | null,"updated_at": string
                  }
                  ComputedFields: never
                  Insert: {
                    "body_snapshot"?: string | null,"channel": string,"created_at"?: string,"customer_id"?: string | null,"id"?: string,"notification_event_id"?: string | null,"order_id"?: string | null,"read_at"?: string | null,"recipient_snapshot"?: string | null,"status"?: string,"subject_snapshot"?: string | null,"template_id"?: string | null,"updated_at"?: string
                  }
                  Update: {
                    "body_snapshot"?: string | null,"channel"?: string,"created_at"?: string,"customer_id"?: string | null,"id"?: string,"notification_event_id"?: string | null,"order_id"?: string | null,"read_at"?: string | null,"recipient_snapshot"?: string | null,"status"?: string,"subject_snapshot"?: string | null,"template_id"?: string | null,"updated_at"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "notifications_customer_id_fkey"
      columns: ["customer_id"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "notifications_notification_event_id_fkey"
      columns: ["notification_event_id"]
isOneToOne: false
      referencedRelation: "notification_events"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "notifications_order_id_fkey"
      columns: ["order_id"]
isOneToOne: false
      referencedRelation: "orders"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "notifications_template_id_fkey"
      columns: ["template_id"]
isOneToOne: false
      referencedRelation: "notification_templates"
      referencedColumns: ["id"]
    }
                  ]
                },"order_cancellation_requests": {
                  Row: {
                    "created_at": string,"decided_at": string | null,"decision_by": string | null,"decision_reason": string | null,"executed_at": string | null,"guest_contact_snapshot": Json | null,"id": string,"order_id": string,"reason": string | null,"reason_code": string | null,"requested_by_customer_id": string | null,"status": string,"updated_at": string
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string,"decided_at"?: string | null,"decision_by"?: string | null,"decision_reason"?: string | null,"executed_at"?: string | null,"guest_contact_snapshot"?: Json | null,"id"?: string,"order_id": string,"reason"?: string | null,"reason_code"?: string | null,"requested_by_customer_id"?: string | null,"status"?: string,"updated_at"?: string
                  }
                  Update: {
                    "created_at"?: string,"decided_at"?: string | null,"decision_by"?: string | null,"decision_reason"?: string | null,"executed_at"?: string | null,"guest_contact_snapshot"?: Json | null,"id"?: string,"order_id"?: string,"reason"?: string | null,"reason_code"?: string | null,"requested_by_customer_id"?: string | null,"status"?: string,"updated_at"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "order_cancellation_requests_order_id_fkey"
      columns: ["order_id"]
isOneToOne: false
      referencedRelation: "orders"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "order_cancellation_requests_requested_by_customer_id_fkey"
      columns: ["requested_by_customer_id"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    }
                  ]
                },"order_discounts": {
                  Row: {
                    "applied_amount": number,"code_snapshot": string | null,"coupon_id": string | null,"created_at": string,"discount_type": string,"discount_value": number,"id": string,"name_snapshot": string,"order_id": string,"promotion_id": string | null,"rule_snapshot": NonNullable<Json>
                  }
                  ComputedFields: never
                  Insert: {
                    "applied_amount": number,"code_snapshot"?: string | null,"coupon_id"?: string | null,"created_at"?: string,"discount_type": string,"discount_value": number,"id"?: string,"name_snapshot": string,"order_id": string,"promotion_id"?: string | null,"rule_snapshot": NonNullable<Json>
                  }
                  Update: {
                    "applied_amount"?: number,"code_snapshot"?: string | null,"coupon_id"?: string | null,"created_at"?: string,"discount_type"?: string,"discount_value"?: number,"id"?: string,"name_snapshot"?: string,"order_id"?: string,"promotion_id"?: string | null,"rule_snapshot"?: NonNullable<Json>
                  }
                  Relationships: [
                    {
      foreignKeyName: "order_discounts_coupon_id_fkey"
      columns: ["coupon_id"]
isOneToOne: false
      referencedRelation: "coupons"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "order_discounts_order_id_fkey"
      columns: ["order_id"]
isOneToOne: false
      referencedRelation: "orders"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "order_discounts_promotion_id_fkey"
      columns: ["promotion_id"]
isOneToOne: false
      referencedRelation: "promotions"
      referencedColumns: ["id"]
    }
                  ]
                },"order_items": {
                  Row: {
                    "attributes_snapshot": NonNullable<Json>,"created_at": string,"currency_code": string,"id": string,"line_discount": number,"line_subtotal": number,"line_total": number,"order_id": string,"product_id": string | null,"product_name_snapshot": string,"quantity": number,"sku_snapshot": string,"unit_discount": number,"unit_price": number,"variant_id": string | null,"variant_name_snapshot": string | null
                  }
                  ComputedFields: never
                  Insert: {
                    "attributes_snapshot"?: NonNullable<Json>,"created_at"?: string,"currency_code"?: string,"id"?: string,"line_discount"?: number,"line_subtotal": number,"line_total": number,"order_id": string,"product_id"?: string | null,"product_name_snapshot": string,"quantity": number,"sku_snapshot": string,"unit_discount"?: number,"unit_price": number,"variant_id"?: string | null,"variant_name_snapshot"?: string | null
                  }
                  Update: {
                    "attributes_snapshot"?: NonNullable<Json>,"created_at"?: string,"currency_code"?: string,"id"?: string,"line_discount"?: number,"line_subtotal"?: number,"line_total"?: number,"order_id"?: string,"product_id"?: string | null,"product_name_snapshot"?: string,"quantity"?: number,"sku_snapshot"?: string,"unit_discount"?: number,"unit_price"?: number,"variant_id"?: string | null,"variant_name_snapshot"?: string | null
                  }
                  Relationships: [
                    {
      foreignKeyName: "order_items_order_id_fkey"
      columns: ["order_id"]
isOneToOne: false
      referencedRelation: "orders"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "order_items_variant_id_product_id_fkey"
      columns: ["variant_id","product_id"]
isOneToOne: false
      referencedRelation: "product_variants"
      referencedColumns: ["id","product_id"]
    }
                  ]
                },"order_payment_status_history": {
                  Row: {
                    "actor_type": string,"actor_user_id": string | null,"created_at": string,"from_status": string | null,"id": string,"order_id": string,"reason": string | null,"request_id": string | null,"to_status": string
                  }
                  ComputedFields: never
                  Insert: {
                    "actor_type": string,"actor_user_id"?: string | null,"created_at"?: string,"from_status"?: string | null,"id"?: string,"order_id": string,"reason"?: string | null,"request_id"?: string | null,"to_status": string
                  }
                  Update: {
                    "actor_type"?: string,"actor_user_id"?: string | null,"created_at"?: string,"from_status"?: string | null,"id"?: string,"order_id"?: string,"reason"?: string | null,"request_id"?: string | null,"to_status"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "order_payment_status_history_order_id_fkey"
      columns: ["order_id"]
isOneToOne: false
      referencedRelation: "orders"
      referencedColumns: ["id"]
    }
                  ]
                },"order_status_history": {
                  Row: {
                    "actor_type": string,"actor_user_id": string | null,"created_at": string,"from_status": string | null,"id": string,"order_id": string,"reason": string | null,"request_id": string | null,"to_status": string
                  }
                  ComputedFields: never
                  Insert: {
                    "actor_type": string,"actor_user_id"?: string | null,"created_at"?: string,"from_status"?: string | null,"id"?: string,"order_id": string,"reason"?: string | null,"request_id"?: string | null,"to_status": string
                  }
                  Update: {
                    "actor_type"?: string,"actor_user_id"?: string | null,"created_at"?: string,"from_status"?: string | null,"id"?: string,"order_id"?: string,"reason"?: string | null,"request_id"?: string | null,"to_status"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "order_status_history_order_id_fkey"
      columns: ["order_id"]
isOneToOne: false
      referencedRelation: "orders"
      referencedColumns: ["id"]
    }
                  ]
                },"orders": {
                  Row: {
                    "admin_note": string | null,"billing_address_snapshot": Json | null,"cancelled_at": string | null,"checkout_idempotency_key": string,"checkout_request_hash": string,"cod_terms_snapshot": Json | null,"confirmed_at": string | null,"created_at": string,"currency_code": string,"customer_id": string | null,"customer_note": string | null,"delivered_at": string | null,"delivery_address_snapshot": NonNullable<Json>,"discount_total": number,"grand_total": number,"guest_email": string | null,"guest_name": string | null,"guest_phone_e164": string | null,"id": string,"payment_status": string,"public_reference": string,"selected_payment_method_code": string,"shipped_at": string | null,"shipping_fee": number,"shipping_rule_snapshot": Json | null,"shipping_zone_id": string | null,"status": string,"subtotal": number,"tax_total": number,"updated_at": string,"whatsapp_handoff_attempted_at": string | null
                  }
                  ComputedFields: never
                  Insert: {
                    "admin_note"?: string | null,"billing_address_snapshot"?: Json | null,"cancelled_at"?: string | null,"checkout_idempotency_key": string,"checkout_request_hash": string,"cod_terms_snapshot"?: Json | null,"confirmed_at"?: string | null,"created_at"?: string,"currency_code"?: string,"customer_id"?: string | null,"customer_note"?: string | null,"delivered_at"?: string | null,"delivery_address_snapshot": NonNullable<Json>,"discount_total"?: number,"grand_total": number,"guest_email"?: string | null,"guest_name"?: string | null,"guest_phone_e164"?: string | null,"id"?: string,"payment_status"?: string,"public_reference": string,"selected_payment_method_code": string,"shipped_at"?: string | null,"shipping_fee"?: number,"shipping_rule_snapshot"?: Json | null,"shipping_zone_id"?: string | null,"status"?: string,"subtotal": number,"tax_total"?: number,"updated_at"?: string,"whatsapp_handoff_attempted_at"?: string | null
                  }
                  Update: {
                    "admin_note"?: string | null,"billing_address_snapshot"?: Json | null,"cancelled_at"?: string | null,"checkout_idempotency_key"?: string,"checkout_request_hash"?: string,"cod_terms_snapshot"?: Json | null,"confirmed_at"?: string | null,"created_at"?: string,"currency_code"?: string,"customer_id"?: string | null,"customer_note"?: string | null,"delivered_at"?: string | null,"delivery_address_snapshot"?: NonNullable<Json>,"discount_total"?: number,"grand_total"?: number,"guest_email"?: string | null,"guest_name"?: string | null,"guest_phone_e164"?: string | null,"id"?: string,"payment_status"?: string,"public_reference"?: string,"selected_payment_method_code"?: string,"shipped_at"?: string | null,"shipping_fee"?: number,"shipping_rule_snapshot"?: Json | null,"shipping_zone_id"?: string | null,"status"?: string,"subtotal"?: number,"tax_total"?: number,"updated_at"?: string,"whatsapp_handoff_attempted_at"?: string | null
                  }
                  Relationships: [
                    {
      foreignKeyName: "orders_customer_id_fkey"
      columns: ["customer_id"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "orders_selected_payment_method_fk"
      columns: ["selected_payment_method_code"]
isOneToOne: false
      referencedRelation: "payment_methods"
      referencedColumns: ["code"]
    },{
      foreignKeyName: "orders_shipping_zone_fk"
      columns: ["shipping_zone_id"]
isOneToOne: false
      referencedRelation: "shipping_zones"
      referencedColumns: ["id"]
    }
                  ]
                },"outbox_events": {
                  Row: {
                    "aggregate_id": string,"aggregate_type": string,"attempt_count": number,"available_at": string,"created_at": string,"event_type": string,"id": string,"idempotency_key": string,"last_error_safe": string | null,"payload": NonNullable<Json>,"sent_at": string | null,"status": string,"updated_at": string
                  }
                  ComputedFields: never
                  Insert: {
                    "aggregate_id": string,"aggregate_type": string,"attempt_count"?: number,"available_at"?: string,"created_at"?: string,"event_type": string,"id"?: string,"idempotency_key": string,"last_error_safe"?: string | null,"payload"?: NonNullable<Json>,"sent_at"?: string | null,"status"?: string,"updated_at"?: string
                  }
                  Update: {
                    "aggregate_id"?: string,"aggregate_type"?: string,"attempt_count"?: number,"available_at"?: string,"created_at"?: string,"event_type"?: string,"id"?: string,"idempotency_key"?: string,"last_error_safe"?: string | null,"payload"?: NonNullable<Json>,"sent_at"?: string | null,"status"?: string,"updated_at"?: string
                  }
                  Relationships: [
                    
                  ]
                },"payment_attempts": {
                  Row: {
                    "attempt_number": number,"completed_at": string | null,"created_at": string,"error_code": string | null,"error_message_safe": string | null,"id": string,"idempotency_key": string,"payment_id": string,"request_hash": string,"request_reference": string | null,"response_reference": string | null,"started_at": string | null,"status": string
                  }
                  ComputedFields: never
                  Insert: {
                    "attempt_number": number,"completed_at"?: string | null,"created_at"?: string,"error_code"?: string | null,"error_message_safe"?: string | null,"id"?: string,"idempotency_key": string,"payment_id": string,"request_hash": string,"request_reference"?: string | null,"response_reference"?: string | null,"started_at"?: string | null,"status": string
                  }
                  Update: {
                    "attempt_number"?: number,"completed_at"?: string | null,"created_at"?: string,"error_code"?: string | null,"error_message_safe"?: string | null,"id"?: string,"idempotency_key"?: string,"payment_id"?: string,"request_hash"?: string,"request_reference"?: string | null,"response_reference"?: string | null,"started_at"?: string | null,"status"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "payment_attempts_payment_id_fkey"
      columns: ["payment_id"]
isOneToOne: false
      referencedRelation: "payments"
      referencedColumns: ["id"]
    }
                  ]
                },"payment_evidence": {
                  Row: {
                    "bucket_name": string,"checksum_sha256": string | null,"created_at": string,"file_size_bytes": number,"id": string,"mime_type": string,"object_path": string,"original_filename": string | null,"payment_attempt_id": string | null,"payment_id": string,"reviewed_at": string | null,"reviewed_by": string | null,"uploaded_at": string,"uploaded_by": string | null
                  }
                  ComputedFields: never
                  Insert: {
                    "bucket_name": string,"checksum_sha256"?: string | null,"created_at"?: string,"file_size_bytes": number,"id"?: string,"mime_type": string,"object_path": string,"original_filename"?: string | null,"payment_attempt_id"?: string | null,"payment_id": string,"reviewed_at"?: string | null,"reviewed_by"?: string | null,"uploaded_at"?: string,"uploaded_by"?: string | null
                  }
                  Update: {
                    "bucket_name"?: string,"checksum_sha256"?: string | null,"created_at"?: string,"file_size_bytes"?: number,"id"?: string,"mime_type"?: string,"object_path"?: string,"original_filename"?: string | null,"payment_attempt_id"?: string | null,"payment_id"?: string,"reviewed_at"?: string | null,"reviewed_by"?: string | null,"uploaded_at"?: string,"uploaded_by"?: string | null
                  }
                  Relationships: [
                    {
      foreignKeyName: "payment_evidence_payment_attempt_id_fkey"
      columns: ["payment_attempt_id"]
isOneToOne: false
      referencedRelation: "payment_attempts"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "payment_evidence_payment_id_fkey"
      columns: ["payment_id"]
isOneToOne: false
      referencedRelation: "payments"
      referencedColumns: ["id"]
    }
                  ]
                },"payment_methods": {
                  Row: {
                    "code": string,"configuration": NonNullable<Json>,"created_at": string,"display_name": string,"id": string,"is_enabled": boolean,"phase": string,"provider_code": string | null,"public_configuration": NonNullable<Json>,"sort_order": number,"updated_at": string
                  }
                  ComputedFields: never
                  Insert: {
                    "code": string,"configuration"?: NonNullable<Json>,"created_at"?: string,"display_name": string,"id"?: string,"is_enabled"?: boolean,"phase": string,"provider_code"?: string | null,"public_configuration"?: NonNullable<Json>,"sort_order"?: number,"updated_at"?: string
                  }
                  Update: {
                    "code"?: string,"configuration"?: NonNullable<Json>,"created_at"?: string,"display_name"?: string,"id"?: string,"is_enabled"?: boolean,"phase"?: string,"provider_code"?: string | null,"public_configuration"?: NonNullable<Json>,"sort_order"?: number,"updated_at"?: string
                  }
                  Relationships: [
                    
                  ]
                },"payment_status_history": {
                  Row: {
                    "actor_type": string,"actor_user_id": string | null,"created_at": string,"from_status": string | null,"id": string,"payment_id": string,"provider_event_id": string | null,"reason": string | null,"to_status": string
                  }
                  ComputedFields: never
                  Insert: {
                    "actor_type": string,"actor_user_id"?: string | null,"created_at"?: string,"from_status"?: string | null,"id"?: string,"payment_id": string,"provider_event_id"?: string | null,"reason"?: string | null,"to_status": string
                  }
                  Update: {
                    "actor_type"?: string,"actor_user_id"?: string | null,"created_at"?: string,"from_status"?: string | null,"id"?: string,"payment_id"?: string,"provider_event_id"?: string | null,"reason"?: string | null,"to_status"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "payment_status_history_payment_id_fkey"
      columns: ["payment_id"]
isOneToOne: false
      referencedRelation: "payments"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "payment_status_history_provider_event_fk"
      columns: ["provider_event_id"]
isOneToOne: false
      referencedRelation: "webhook_events"
      referencedColumns: ["id"]
    }
                  ]
                },"payment_transactions": {
                  Row: {
                    "amount": number,"created_at": string,"currency_code": string,"id": string,"payment_attempt_id": string | null,"payment_id": string,"provider_code": string,"provider_occurred_at": string | null,"provider_transaction_id": string | null,"safe_metadata": NonNullable<Json>,"status": string,"transaction_type": string,"verified_at": string | null
                  }
                  ComputedFields: never
                  Insert: {
                    "amount": number,"created_at"?: string,"currency_code"?: string,"id"?: string,"payment_attempt_id"?: string | null,"payment_id": string,"provider_code": string,"provider_occurred_at"?: string | null,"provider_transaction_id"?: string | null,"safe_metadata"?: NonNullable<Json>,"status": string,"transaction_type": string,"verified_at"?: string | null
                  }
                  Update: {
                    "amount"?: number,"created_at"?: string,"currency_code"?: string,"id"?: string,"payment_attempt_id"?: string | null,"payment_id"?: string,"provider_code"?: string,"provider_occurred_at"?: string | null,"provider_transaction_id"?: string | null,"safe_metadata"?: NonNullable<Json>,"status"?: string,"transaction_type"?: string,"verified_at"?: string | null
                  }
                  Relationships: [
                    {
      foreignKeyName: "payment_transactions_payment_attempt_id_fkey"
      columns: ["payment_attempt_id"]
isOneToOne: false
      referencedRelation: "payment_attempts"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "payment_transactions_payment_id_fkey"
      columns: ["payment_id"]
isOneToOne: false
      referencedRelation: "payments"
      referencedColumns: ["id"]
    }
                  ]
                },"payments": {
                  Row: {
                    "amount": number,"created_at": string,"currency_code": string,"customer_reference": string | null,"id": string,"order_id": string,"paid_at": string | null,"payment_method_id": string,"provider_code": string | null,"provider_payment_reference": string | null,"rejection_reason": string | null,"status": string,"updated_at": string,"verified_at": string | null,"verified_by": string | null
                  }
                  ComputedFields: never
                  Insert: {
                    "amount": number,"created_at"?: string,"currency_code"?: string,"customer_reference"?: string | null,"id"?: string,"order_id": string,"paid_at"?: string | null,"payment_method_id": string,"provider_code"?: string | null,"provider_payment_reference"?: string | null,"rejection_reason"?: string | null,"status": string,"updated_at"?: string,"verified_at"?: string | null,"verified_by"?: string | null
                  }
                  Update: {
                    "amount"?: number,"created_at"?: string,"currency_code"?: string,"customer_reference"?: string | null,"id"?: string,"order_id"?: string,"paid_at"?: string | null,"payment_method_id"?: string,"provider_code"?: string | null,"provider_payment_reference"?: string | null,"rejection_reason"?: string | null,"status"?: string,"updated_at"?: string,"verified_at"?: string | null,"verified_by"?: string | null
                  }
                  Relationships: [
                    {
      foreignKeyName: "payments_order_id_fkey"
      columns: ["order_id"]
isOneToOne: false
      referencedRelation: "orders"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "payments_payment_method_id_fkey"
      columns: ["payment_method_id"]
isOneToOne: false
      referencedRelation: "payment_methods"
      referencedColumns: ["id"]
    }
                  ]
                },"permissions": {
                  Row: {
                    "action": string,"code": string,"created_at": string,"description": string | null,"id": string,"module": string
                  }
                  ComputedFields: never
                  Insert: {
                    "action": string,"code": string,"created_at"?: string,"description"?: string | null,"id"?: string,"module": string
                  }
                  Update: {
                    "action"?: string,"code"?: string,"created_at"?: string,"description"?: string | null,"id"?: string,"module"?: string
                  }
                  Relationships: [
                    
                  ]
                },"product_attributes": {
                  Row: {
                    "attribute_id": string,"is_required": boolean,"product_id": string,"sort_order": number
                  }
                  ComputedFields: never
                  Insert: {
                    "attribute_id": string,"is_required"?: boolean,"product_id": string,"sort_order"?: number
                  }
                  Update: {
                    "attribute_id"?: string,"is_required"?: boolean,"product_id"?: string,"sort_order"?: number
                  }
                  Relationships: [
                    {
      foreignKeyName: "product_attributes_attribute_id_fkey"
      columns: ["attribute_id"]
isOneToOne: false
      referencedRelation: "attributes"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "product_attributes_product_id_fkey"
      columns: ["product_id"]
isOneToOne: false
      referencedRelation: "products"
      referencedColumns: ["id"]
    }
                  ]
                },"product_categories": {
                  Row: {
                    "category_id": string,"created_at": string,"is_primary": boolean,"product_id": string,"sort_order": number
                  }
                  ComputedFields: never
                  Insert: {
                    "category_id": string,"created_at"?: string,"is_primary"?: boolean,"product_id": string,"sort_order"?: number
                  }
                  Update: {
                    "category_id"?: string,"created_at"?: string,"is_primary"?: boolean,"product_id"?: string,"sort_order"?: number
                  }
                  Relationships: [
                    {
      foreignKeyName: "product_categories_category_id_fkey"
      columns: ["category_id"]
isOneToOne: false
      referencedRelation: "categories"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "product_categories_product_id_fkey"
      columns: ["product_id"]
isOneToOne: false
      referencedRelation: "products"
      referencedColumns: ["id"]
    }
                  ]
                },"product_media": {
                  Row: {
                    "created_at": string,"id": string,"is_primary": boolean,"media_asset_id": string,"media_role": string,"product_id": string,"sort_order": number,"variant_id": string | null
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string,"id"?: string,"is_primary"?: boolean,"media_asset_id": string,"media_role": string,"product_id": string,"sort_order"?: number,"variant_id"?: string | null
                  }
                  Update: {
                    "created_at"?: string,"id"?: string,"is_primary"?: boolean,"media_asset_id"?: string,"media_role"?: string,"product_id"?: string,"sort_order"?: number,"variant_id"?: string | null
                  }
                  Relationships: [
                    {
      foreignKeyName: "product_media_media_asset_id_fkey"
      columns: ["media_asset_id"]
isOneToOne: false
      referencedRelation: "media_assets"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "product_media_product_id_fkey"
      columns: ["product_id"]
isOneToOne: false
      referencedRelation: "products"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "product_media_variant_id_product_id_fkey"
      columns: ["variant_id","product_id"]
isOneToOne: false
      referencedRelation: "product_variants"
      referencedColumns: ["id","product_id"]
    }
                  ]
                },"product_size_guides": {
                  Row: {
                    "is_primary": boolean,"product_id": string,"size_guide_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "is_primary"?: boolean,"product_id": string,"size_guide_id": string
                  }
                  Update: {
                    "is_primary"?: boolean,"product_id"?: string,"size_guide_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "product_size_guides_product_id_fkey"
      columns: ["product_id"]
isOneToOne: false
      referencedRelation: "products"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "product_size_guides_size_guide_id_fkey"
      columns: ["size_guide_id"]
isOneToOne: false
      referencedRelation: "size_guides"
      referencedColumns: ["id"]
    }
                  ]
                },"product_translations": {
                  Row: {
                    "care_instructions": string | null,"created_at": string,"description": string | null,"fit_notes": string | null,"id": string,"locale": string,"material": string | null,"name": string,"product_id": string,"seo_description": string | null,"seo_title": string | null,"short_description": string | null
                  }
                  ComputedFields: never
                  Insert: {
                    "care_instructions"?: string | null,"created_at"?: string,"description"?: string | null,"fit_notes"?: string | null,"id"?: string,"locale": string,"material"?: string | null,"name": string,"product_id": string,"seo_description"?: string | null,"seo_title"?: string | null,"short_description"?: string | null
                  }
                  Update: {
                    "care_instructions"?: string | null,"created_at"?: string,"description"?: string | null,"fit_notes"?: string | null,"id"?: string,"locale"?: string,"material"?: string | null,"name"?: string,"product_id"?: string,"seo_description"?: string | null,"seo_title"?: string | null,"short_description"?: string | null
                  }
                  Relationships: [
                    {
      foreignKeyName: "product_translations_product_id_fkey"
      columns: ["product_id"]
isOneToOne: false
      referencedRelation: "products"
      referencedColumns: ["id"]
    }
                  ]
                },"product_variant_options": {
                  Row: {
                    "attribute_id": string,"attribute_value_id": string,"created_at": string,"product_id": string,"variant_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "attribute_id": string,"attribute_value_id": string,"created_at"?: string,"product_id": string,"variant_id": string
                  }
                  Update: {
                    "attribute_id"?: string,"attribute_value_id"?: string,"created_at"?: string,"product_id"?: string,"variant_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "product_variant_options_attribute_id_attribute_value_id_fkey"
      columns: ["attribute_id","attribute_value_id"]
isOneToOne: false
      referencedRelation: "attribute_values"
      referencedColumns: ["attribute_id","id"]
    },{
      foreignKeyName: "product_variant_options_product_id_attribute_id_fkey"
      columns: ["product_id","attribute_id"]
isOneToOne: false
      referencedRelation: "product_attributes"
      referencedColumns: ["product_id","attribute_id"]
    },{
      foreignKeyName: "product_variant_options_variant_id_product_id_fkey"
      columns: ["variant_id","product_id"]
isOneToOne: false
      referencedRelation: "product_variants"
      referencedColumns: ["id","product_id"]
    }
                  ]
                },"product_variants": {
                  Row: {
                    "barcode": string | null,"created_at": string,"deleted_at": string | null,"id": string,"option_signature": string,"price_override": number | null,"product_id": string,"sale_ends_at": string | null,"sale_price_override": number | null,"sale_starts_at": string | null,"sku": string,"sort_order": number,"status": string,"updated_at": string,"weight_grams": number | null
                  }
                  ComputedFields: never
                  Insert: {
                    "barcode"?: string | null,"created_at"?: string,"deleted_at"?: string | null,"id"?: string,"option_signature": string,"price_override"?: number | null,"product_id": string,"sale_ends_at"?: string | null,"sale_price_override"?: number | null,"sale_starts_at"?: string | null,"sku": string,"sort_order"?: number,"status"?: string,"updated_at"?: string,"weight_grams"?: number | null
                  }
                  Update: {
                    "barcode"?: string | null,"created_at"?: string,"deleted_at"?: string | null,"id"?: string,"option_signature"?: string,"price_override"?: number | null,"product_id"?: string,"sale_ends_at"?: string | null,"sale_price_override"?: number | null,"sale_starts_at"?: string | null,"sku"?: string,"sort_order"?: number,"status"?: string,"updated_at"?: string,"weight_grams"?: number | null
                  }
                  Relationships: [
                    {
      foreignKeyName: "product_variants_product_id_fkey"
      columns: ["product_id"]
isOneToOne: false
      referencedRelation: "products"
      referencedColumns: ["id"]
    }
                  ]
                },"products": {
                  Row: {
                    "canonical_url": string | null,"care_instructions": string | null,"created_at": string,"currency_code": string,"default_price": number,"deleted_at": string | null,"description": string | null,"fit_notes": string | null,"id": string,"is_featured": boolean,"material": string | null,"name": string,"product_type": string | null,"published_at": string | null,"sale_ends_at": string | null,"sale_price": number | null,"sale_starts_at": string | null,"search_vector": unknown,"seo_description": string | null,"seo_title": string | null,"short_description": string | null,"slug": string,"sort_order": number,"status": string,"updated_at": string
                  }
                  ComputedFields: never
                  Insert: {
                    "canonical_url"?: string | null,"care_instructions"?: string | null,"created_at"?: string,"currency_code"?: string,"default_price": number,"deleted_at"?: string | null,"description"?: string | null,"fit_notes"?: string | null,"id"?: string,"is_featured"?: boolean,"material"?: string | null,"name": string,"product_type"?: string | null,"published_at"?: string | null,"sale_ends_at"?: string | null,"sale_price"?: number | null,"sale_starts_at"?: string | null,"search_vector"?: never,"seo_description"?: string | null,"seo_title"?: string | null,"short_description"?: string | null,"slug": string,"sort_order"?: number,"status"?: string,"updated_at"?: string
                  }
                  Update: {
                    "canonical_url"?: string | null,"care_instructions"?: string | null,"created_at"?: string,"currency_code"?: string,"default_price"?: number,"deleted_at"?: string | null,"description"?: string | null,"fit_notes"?: string | null,"id"?: string,"is_featured"?: boolean,"material"?: string | null,"name"?: string,"product_type"?: string | null,"published_at"?: string | null,"sale_ends_at"?: string | null,"sale_price"?: number | null,"sale_starts_at"?: string | null,"search_vector"?: never,"seo_description"?: string | null,"seo_title"?: string | null,"short_description"?: string | null,"slug"?: string,"sort_order"?: number,"status"?: string,"updated_at"?: string
                  }
                  Relationships: [
                    
                  ]
                },"profiles": {
                  Row: {
                    "account_status": string,"avatar_media_id": string | null,"created_at": string,"display_name": string | null,"email": string | null,"id": string,"phone_e164": string | null,"phone_verified_at": string | null,"preferred_locale": string,"updated_at": string
                  }
                  ComputedFields: never
                  Insert: {
                    "account_status"?: string,"avatar_media_id"?: string | null,"created_at"?: string,"display_name"?: string | null,"email"?: string | null,"id": string,"phone_e164"?: string | null,"phone_verified_at"?: string | null,"preferred_locale"?: string,"updated_at"?: string
                  }
                  Update: {
                    "account_status"?: string,"avatar_media_id"?: string | null,"created_at"?: string,"display_name"?: string | null,"email"?: string | null,"id"?: string,"phone_e164"?: string | null,"phone_verified_at"?: string | null,"preferred_locale"?: string,"updated_at"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "profiles_avatar_media_id_fkey"
      columns: ["avatar_media_id"]
isOneToOne: false
      referencedRelation: "media_assets"
      referencedColumns: ["id"]
    }
                  ]
                },"promotion_categories": {
                  Row: {
                    "category_id": string,"promotion_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "category_id": string,"promotion_id": string
                  }
                  Update: {
                    "category_id"?: string,"promotion_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "promotion_categories_category_id_fkey"
      columns: ["category_id"]
isOneToOne: false
      referencedRelation: "categories"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "promotion_categories_promotion_id_fkey"
      columns: ["promotion_id"]
isOneToOne: false
      referencedRelation: "promotions"
      referencedColumns: ["id"]
    }
                  ]
                },"promotion_products": {
                  Row: {
                    "product_id": string,"promotion_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "product_id": string,"promotion_id": string
                  }
                  Update: {
                    "product_id"?: string,"promotion_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "promotion_products_product_id_fkey"
      columns: ["product_id"]
isOneToOne: false
      referencedRelation: "products"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "promotion_products_promotion_id_fkey"
      columns: ["promotion_id"]
isOneToOne: false
      referencedRelation: "promotions"
      referencedColumns: ["id"]
    }
                  ]
                },"promotions": {
                  Row: {
                    "created_at": string,"created_by": string | null,"description": string | null,"discount_type": string,"discount_value": number,"ends_at": string | null,"id": string,"maximum_discount": number | null,"minimum_order_total": number | null,"name": string,"per_customer_limit": number | null,"priority": number,"promotion_type": string,"stacking_rule": string,"starts_at": string | null,"status": string,"updated_at": string,"usage_limit": number | null
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string,"created_by"?: string | null,"description"?: string | null,"discount_type": string,"discount_value": number,"ends_at"?: string | null,"id"?: string,"maximum_discount"?: number | null,"minimum_order_total"?: number | null,"name": string,"per_customer_limit"?: number | null,"priority"?: number,"promotion_type": string,"stacking_rule"?: string,"starts_at"?: string | null,"status"?: string,"updated_at"?: string,"usage_limit"?: number | null
                  }
                  Update: {
                    "created_at"?: string,"created_by"?: string | null,"description"?: string | null,"discount_type"?: string,"discount_value"?: number,"ends_at"?: string | null,"id"?: string,"maximum_discount"?: number | null,"minimum_order_total"?: number | null,"name"?: string,"per_customer_limit"?: number | null,"priority"?: number,"promotion_type"?: string,"stacking_rule"?: string,"starts_at"?: string | null,"status"?: string,"updated_at"?: string,"usage_limit"?: number | null
                  }
                  Relationships: [
                    
                  ]
                },"provinces": {
                  Row: {
                    "code": string,"created_at": string,"id": string,"is_active": boolean,"name_en": string,"name_ne": string | null,"sort_order": number,"updated_at": string
                  }
                  ComputedFields: never
                  Insert: {
                    "code": string,"created_at"?: string,"id"?: string,"is_active"?: boolean,"name_en": string,"name_ne"?: string | null,"sort_order"?: number,"updated_at"?: string
                  }
                  Update: {
                    "code"?: string,"created_at"?: string,"id"?: string,"is_active"?: boolean,"name_en"?: string,"name_ne"?: string | null,"sort_order"?: number,"updated_at"?: string
                  }
                  Relationships: [
                    
                  ]
                },"recently_viewed_products": {
                  Row: {
                    "customer_id": string | null,"guest_session_hash": string | null,"id": string,"last_viewed_at": string,"product_id": string,"view_count": number
                  }
                  ComputedFields: never
                  Insert: {
                    "customer_id"?: string | null,"guest_session_hash"?: string | null,"id"?: string,"last_viewed_at": string,"product_id": string,"view_count"?: number
                  }
                  Update: {
                    "customer_id"?: string | null,"guest_session_hash"?: string | null,"id"?: string,"last_viewed_at"?: string,"product_id"?: string,"view_count"?: number
                  }
                  Relationships: [
                    {
      foreignKeyName: "recently_viewed_products_customer_id_fkey"
      columns: ["customer_id"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "recently_viewed_products_product_id_fkey"
      columns: ["product_id"]
isOneToOne: false
      referencedRelation: "products"
      referencedColumns: ["id"]
    }
                  ]
                },"refund_status_history": {
                  Row: {
                    "actor_user_id": string | null,"created_at": string,"from_status": string | null,"id": string,"reason": string | null,"refund_id": string,"to_status": string
                  }
                  ComputedFields: never
                  Insert: {
                    "actor_user_id"?: string | null,"created_at"?: string,"from_status"?: string | null,"id"?: string,"reason"?: string | null,"refund_id": string,"to_status": string
                  }
                  Update: {
                    "actor_user_id"?: string | null,"created_at"?: string,"from_status"?: string | null,"id"?: string,"reason"?: string | null,"refund_id"?: string,"to_status"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "refund_status_history_refund_id_fkey"
      columns: ["refund_id"]
isOneToOne: false
      referencedRelation: "refunds"
      referencedColumns: ["id"]
    }
                  ]
                },"refunds": {
                  Row: {
                    "amount": number,"approved_by": string | null,"created_at": string,"currency_code": string,"id": string,"order_id": string,"payment_id": string,"processed_at": string | null,"processed_by": string | null,"provider_refund_reference": string | null,"reason": string,"requested_by": string | null,"return_request_id": string | null,"status": string,"updated_at": string
                  }
                  ComputedFields: never
                  Insert: {
                    "amount": number,"approved_by"?: string | null,"created_at"?: string,"currency_code"?: string,"id"?: string,"order_id": string,"payment_id": string,"processed_at"?: string | null,"processed_by"?: string | null,"provider_refund_reference"?: string | null,"reason": string,"requested_by"?: string | null,"return_request_id"?: string | null,"status": string,"updated_at"?: string
                  }
                  Update: {
                    "amount"?: number,"approved_by"?: string | null,"created_at"?: string,"currency_code"?: string,"id"?: string,"order_id"?: string,"payment_id"?: string,"processed_at"?: string | null,"processed_by"?: string | null,"provider_refund_reference"?: string | null,"reason"?: string,"requested_by"?: string | null,"return_request_id"?: string | null,"status"?: string,"updated_at"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "refunds_order_id_fkey"
      columns: ["order_id"]
isOneToOne: false
      referencedRelation: "orders"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "refunds_payment_id_fkey"
      columns: ["payment_id"]
isOneToOne: false
      referencedRelation: "payments"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "refunds_return_request_fk"
      columns: ["return_request_id"]
isOneToOne: false
      referencedRelation: "return_requests"
      referencedColumns: ["id"]
    }
                  ]
                },"related_products": {
                  Row: {
                    "created_at": string,"product_id": string,"related_product_id": string,"relation_type": string,"sort_order": number
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string,"product_id": string,"related_product_id": string,"relation_type"?: string,"sort_order"?: number
                  }
                  Update: {
                    "created_at"?: string,"product_id"?: string,"related_product_id"?: string,"relation_type"?: string,"sort_order"?: number
                  }
                  Relationships: [
                    {
      foreignKeyName: "related_products_product_id_fkey"
      columns: ["product_id"]
isOneToOne: false
      referencedRelation: "products"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "related_products_related_product_id_fkey"
      columns: ["related_product_id"]
isOneToOne: false
      referencedRelation: "products"
      referencedColumns: ["id"]
    }
                  ]
                },"return_inspections": {
                  Row: {
                    "condition": string,"created_at": string,"id": string,"inspected_by": string,"inspection_notes": string | null,"restock_decision": string,"restock_location_id": string | null,"restocked_at": string | null,"return_request_item_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "condition": string,"created_at"?: string,"id"?: string,"inspected_by": string,"inspection_notes"?: string | null,"restock_decision": string,"restock_location_id"?: string | null,"restocked_at"?: string | null,"return_request_item_id": string
                  }
                  Update: {
                    "condition"?: string,"created_at"?: string,"id"?: string,"inspected_by"?: string,"inspection_notes"?: string | null,"restock_decision"?: string,"restock_location_id"?: string | null,"restocked_at"?: string | null,"return_request_item_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "return_inspections_restock_location_id_fkey"
      columns: ["restock_location_id"]
isOneToOne: false
      referencedRelation: "inventory_locations"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "return_inspections_return_request_item_id_fkey"
      columns: ["return_request_item_id"]
isOneToOne: true
      referencedRelation: "return_request_items"
      referencedColumns: ["id"]
    }
                  ]
                },"return_request_items": {
                  Row: {
                    "created_at": string,"id": string,"order_item_id": string,"quantity": number,"reason": string | null,"requested_resolution": string,"return_request_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string,"id"?: string,"order_item_id": string,"quantity": number,"reason"?: string | null,"requested_resolution": string,"return_request_id": string
                  }
                  Update: {
                    "created_at"?: string,"id"?: string,"order_item_id"?: string,"quantity"?: number,"reason"?: string | null,"requested_resolution"?: string,"return_request_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "return_request_items_order_item_id_fkey"
      columns: ["order_item_id"]
isOneToOne: false
      referencedRelation: "order_items"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "return_request_items_return_request_id_fkey"
      columns: ["return_request_id"]
isOneToOne: false
      referencedRelation: "return_requests"
      referencedColumns: ["id"]
    }
                  ]
                },"return_requests": {
                  Row: {
                    "created_at": string,"customer_id": string | null,"customer_notes": string | null,"decided_at": string | null,"decision_by": string | null,"decision_reason": string | null,"guest_contact_snapshot": Json | null,"id": string,"order_id": string,"reason": string | null,"reason_code": string,"request_type": string,"status": string,"updated_at": string
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string,"customer_id"?: string | null,"customer_notes"?: string | null,"decided_at"?: string | null,"decision_by"?: string | null,"decision_reason"?: string | null,"guest_contact_snapshot"?: Json | null,"id"?: string,"order_id": string,"reason"?: string | null,"reason_code": string,"request_type": string,"status"?: string,"updated_at"?: string
                  }
                  Update: {
                    "created_at"?: string,"customer_id"?: string | null,"customer_notes"?: string | null,"decided_at"?: string | null,"decision_by"?: string | null,"decision_reason"?: string | null,"guest_contact_snapshot"?: Json | null,"id"?: string,"order_id"?: string,"reason"?: string | null,"reason_code"?: string,"request_type"?: string,"status"?: string,"updated_at"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "return_requests_customer_id_fkey"
      columns: ["customer_id"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "return_requests_order_id_fkey"
      columns: ["order_id"]
isOneToOne: false
      referencedRelation: "orders"
      referencedColumns: ["id"]
    }
                  ]
                },"return_shipments": {
                  Row: {
                    "courier_id": string | null,"created_at": string,"id": string,"received_at": string | null,"return_request_id": string,"scheduled_at": string | null,"status": string,"tracking_number": string | null,"updated_at": string
                  }
                  ComputedFields: never
                  Insert: {
                    "courier_id"?: string | null,"created_at"?: string,"id"?: string,"received_at"?: string | null,"return_request_id": string,"scheduled_at"?: string | null,"status"?: string,"tracking_number"?: string | null,"updated_at"?: string
                  }
                  Update: {
                    "courier_id"?: string | null,"created_at"?: string,"id"?: string,"received_at"?: string | null,"return_request_id"?: string,"scheduled_at"?: string | null,"status"?: string,"tracking_number"?: string | null,"updated_at"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "return_shipments_courier_id_fkey"
      columns: ["courier_id"]
isOneToOne: false
      referencedRelation: "couriers"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "return_shipments_return_request_id_fkey"
      columns: ["return_request_id"]
isOneToOne: false
      referencedRelation: "return_requests"
      referencedColumns: ["id"]
    }
                  ]
                },"review_media": {
                  Row: {
                    "created_at": string,"id": string,"media_asset_id": string,"review_id": string,"sort_order": number
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string,"id"?: string,"media_asset_id": string,"review_id": string,"sort_order"?: number
                  }
                  Update: {
                    "created_at"?: string,"id"?: string,"media_asset_id"?: string,"review_id"?: string,"sort_order"?: number
                  }
                  Relationships: [
                    {
      foreignKeyName: "review_media_media_asset_id_fkey"
      columns: ["media_asset_id"]
isOneToOne: false
      referencedRelation: "media_assets"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "review_media_review_id_fkey"
      columns: ["review_id"]
isOneToOne: false
      referencedRelation: "reviews"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "review_media_review_id_fkey"
      columns: ["review_id"]
isOneToOne: false
      referencedRelation: "v_public_product_reviews"
      referencedColumns: ["id"]
    }
                  ]
                },"review_reports": {
                  Row: {
                    "created_at": string,"details": string | null,"handled_by": string | null,"id": string,"reason_code": string,"reported_by": string | null,"review_id": string,"status": string,"updated_at": string
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string,"details"?: string | null,"handled_by"?: string | null,"id"?: string,"reason_code": string,"reported_by"?: string | null,"review_id": string,"status"?: string,"updated_at"?: string
                  }
                  Update: {
                    "created_at"?: string,"details"?: string | null,"handled_by"?: string | null,"id"?: string,"reason_code"?: string,"reported_by"?: string | null,"review_id"?: string,"status"?: string,"updated_at"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "review_reports_reported_by_fkey"
      columns: ["reported_by"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "review_reports_review_id_fkey"
      columns: ["review_id"]
isOneToOne: false
      referencedRelation: "reviews"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "review_reports_review_id_fkey"
      columns: ["review_id"]
isOneToOne: false
      referencedRelation: "v_public_product_reviews"
      referencedColumns: ["id"]
    }
                  ]
                },"review_votes": {
                  Row: {
                    "created_at": string,"customer_id": string,"id": string,"is_helpful": boolean,"review_id": string,"updated_at": string
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string,"customer_id": string,"id"?: string,"is_helpful": boolean,"review_id": string,"updated_at"?: string
                  }
                  Update: {
                    "created_at"?: string,"customer_id"?: string,"id"?: string,"is_helpful"?: boolean,"review_id"?: string,"updated_at"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "review_votes_customer_id_fkey"
      columns: ["customer_id"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "review_votes_review_id_fkey"
      columns: ["review_id"]
isOneToOne: false
      referencedRelation: "reviews"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "review_votes_review_id_fkey"
      columns: ["review_id"]
isOneToOne: false
      referencedRelation: "v_public_product_reviews"
      referencedColumns: ["id"]
    }
                  ]
                },"reviews": {
                  Row: {
                    "body": string | null,"created_at": string,"customer_id": string,"id": string,"moderated_at": string | null,"moderated_by": string | null,"moderation_reason": string | null,"order_item_id": string,"product_id": string,"rating": number,"status": string,"title": string | null,"updated_at": string,"verified_purchase": boolean
                  }
                  ComputedFields: never
                  Insert: {
                    "body"?: string | null,"created_at"?: string,"customer_id": string,"id"?: string,"moderated_at"?: string | null,"moderated_by"?: string | null,"moderation_reason"?: string | null,"order_item_id": string,"product_id": string,"rating": number,"status"?: string,"title"?: string | null,"updated_at"?: string,"verified_purchase"?: boolean
                  }
                  Update: {
                    "body"?: string | null,"created_at"?: string,"customer_id"?: string,"id"?: string,"moderated_at"?: string | null,"moderated_by"?: string | null,"moderation_reason"?: string | null,"order_item_id"?: string,"product_id"?: string,"rating"?: number,"status"?: string,"title"?: string | null,"updated_at"?: string,"verified_purchase"?: boolean
                  }
                  Relationships: [
                    {
      foreignKeyName: "reviews_customer_id_fkey"
      columns: ["customer_id"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "reviews_order_item_id_fkey"
      columns: ["order_item_id"]
isOneToOne: false
      referencedRelation: "order_items"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "reviews_product_id_fkey"
      columns: ["product_id"]
isOneToOne: false
      referencedRelation: "products"
      referencedColumns: ["id"]
    }
                  ]
                },"role_permissions": {
                  Row: {
                    "created_at": string,"permission_id": string,"role_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string,"permission_id": string,"role_id": string
                  }
                  Update: {
                    "created_at"?: string,"permission_id"?: string,"role_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "role_permissions_permission_id_fkey"
      columns: ["permission_id"]
isOneToOne: false
      referencedRelation: "permissions"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "role_permissions_role_id_fkey"
      columns: ["role_id"]
isOneToOne: false
      referencedRelation: "roles"
      referencedColumns: ["id"]
    }
                  ]
                },"roles": {
                  Row: {
                    "code": string,"created_at": string,"description": string | null,"id": string,"is_system_role": boolean,"name": string,"updated_at": string
                  }
                  ComputedFields: never
                  Insert: {
                    "code": string,"created_at"?: string,"description"?: string | null,"id"?: string,"is_system_role"?: boolean,"name": string,"updated_at"?: string
                  }
                  Update: {
                    "code"?: string,"created_at"?: string,"description"?: string | null,"id"?: string,"is_system_role"?: boolean,"name"?: string,"updated_at"?: string
                  }
                  Relationships: [
                    
                  ]
                },"shipment_items": {
                  Row: {
                    "created_at": string,"id": string,"order_item_id": string,"quantity": number,"shipment_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string,"id"?: string,"order_item_id": string,"quantity": number,"shipment_id": string
                  }
                  Update: {
                    "created_at"?: string,"id"?: string,"order_item_id"?: string,"quantity"?: number,"shipment_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "shipment_items_order_item_id_fkey"
      columns: ["order_item_id"]
isOneToOne: false
      referencedRelation: "order_items"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "shipment_items_shipment_id_fkey"
      columns: ["shipment_id"]
isOneToOne: false
      referencedRelation: "shipments"
      referencedColumns: ["id"]
    }
                  ]
                },"shipment_tracking_events": {
                  Row: {
                    "created_at": string,"description": string | null,"id": string,"location_text": string | null,"occurred_at": string,"provider_event_id": string | null,"shipment_id": string,"source": string,"status": string
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string,"description"?: string | null,"id"?: string,"location_text"?: string | null,"occurred_at": string,"provider_event_id"?: string | null,"shipment_id": string,"source": string,"status": string
                  }
                  Update: {
                    "created_at"?: string,"description"?: string | null,"id"?: string,"location_text"?: string | null,"occurred_at"?: string,"provider_event_id"?: string | null,"shipment_id"?: string,"source"?: string,"status"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "shipment_tracking_events_shipment_id_fkey"
      columns: ["shipment_id"]
isOneToOne: false
      referencedRelation: "shipments"
      referencedColumns: ["id"]
    }
                  ]
                },"shipments": {
                  Row: {
                    "courier_id": string | null,"created_at": string,"created_by": string | null,"currency_code": string,"delivered_at": string | null,"delivery_exception": string | null,"dispatched_at": string | null,"id": string,"order_id": string,"shipment_reference": string | null,"shipping_fee": number,"status": string,"tracking_number": string | null,"updated_at": string
                  }
                  ComputedFields: never
                  Insert: {
                    "courier_id"?: string | null,"created_at"?: string,"created_by"?: string | null,"currency_code"?: string,"delivered_at"?: string | null,"delivery_exception"?: string | null,"dispatched_at"?: string | null,"id"?: string,"order_id": string,"shipment_reference"?: string | null,"shipping_fee"?: number,"status"?: string,"tracking_number"?: string | null,"updated_at"?: string
                  }
                  Update: {
                    "courier_id"?: string | null,"created_at"?: string,"created_by"?: string | null,"currency_code"?: string,"delivered_at"?: string | null,"delivery_exception"?: string | null,"dispatched_at"?: string | null,"id"?: string,"order_id"?: string,"shipment_reference"?: string | null,"shipping_fee"?: number,"status"?: string,"tracking_number"?: string | null,"updated_at"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "shipments_courier_id_fkey"
      columns: ["courier_id"]
isOneToOne: false
      referencedRelation: "couriers"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "shipments_order_id_fkey"
      columns: ["order_id"]
isOneToOne: false
      referencedRelation: "orders"
      referencedColumns: ["id"]
    }
                  ]
                },"shipping_rates": {
                  Row: {
                    "created_at": string,"currency_code": string,"fee": number,"free_shipping_threshold": number | null,"id": string,"is_active": boolean,"minimum_order_total": number | null,"rate_name": string,"shipping_zone_id": string,"sort_order": number,"updated_at": string,"valid_from": string | null,"valid_until": string | null
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string,"currency_code"?: string,"fee": number,"free_shipping_threshold"?: number | null,"id"?: string,"is_active"?: boolean,"minimum_order_total"?: number | null,"rate_name": string,"shipping_zone_id": string,"sort_order"?: number,"updated_at"?: string,"valid_from"?: string | null,"valid_until"?: string | null
                  }
                  Update: {
                    "created_at"?: string,"currency_code"?: string,"fee"?: number,"free_shipping_threshold"?: number | null,"id"?: string,"is_active"?: boolean,"minimum_order_total"?: number | null,"rate_name"?: string,"shipping_zone_id"?: string,"sort_order"?: number,"updated_at"?: string,"valid_from"?: string | null,"valid_until"?: string | null
                  }
                  Relationships: [
                    {
      foreignKeyName: "shipping_rates_shipping_zone_id_fkey"
      columns: ["shipping_zone_id"]
isOneToOne: false
      referencedRelation: "shipping_zones"
      referencedColumns: ["id"]
    }
                  ]
                },"shipping_zone_districts": {
                  Row: {
                    "district_id": string,"shipping_zone_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "district_id": string,"shipping_zone_id": string
                  }
                  Update: {
                    "district_id"?: string,"shipping_zone_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "shipping_zone_districts_district_id_fkey"
      columns: ["district_id"]
isOneToOne: false
      referencedRelation: "districts"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "shipping_zone_districts_shipping_zone_id_fkey"
      columns: ["shipping_zone_id"]
isOneToOne: false
      referencedRelation: "shipping_zones"
      referencedColumns: ["id"]
    }
                  ]
                },"shipping_zone_municipalities": {
                  Row: {
                    "municipality_id": string,"shipping_zone_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "municipality_id": string,"shipping_zone_id": string
                  }
                  Update: {
                    "municipality_id"?: string,"shipping_zone_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "shipping_zone_municipalities_municipality_id_fkey"
      columns: ["municipality_id"]
isOneToOne: false
      referencedRelation: "municipalities"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "shipping_zone_municipalities_shipping_zone_id_fkey"
      columns: ["shipping_zone_id"]
isOneToOne: false
      referencedRelation: "shipping_zones"
      referencedColumns: ["id"]
    }
                  ]
                },"shipping_zone_provinces": {
                  Row: {
                    "province_id": string,"shipping_zone_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "province_id": string,"shipping_zone_id": string
                  }
                  Update: {
                    "province_id"?: string,"shipping_zone_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "shipping_zone_provinces_province_id_fkey"
      columns: ["province_id"]
isOneToOne: false
      referencedRelation: "provinces"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "shipping_zone_provinces_shipping_zone_id_fkey"
      columns: ["shipping_zone_id"]
isOneToOne: false
      referencedRelation: "shipping_zones"
      referencedColumns: ["id"]
    }
                  ]
                },"shipping_zones": {
                  Row: {
                    "code": string,"created_at": string,"description": string | null,"id": string,"is_active": boolean,"name": string,"priority": number,"updated_at": string
                  }
                  ComputedFields: never
                  Insert: {
                    "code": string,"created_at"?: string,"description"?: string | null,"id"?: string,"is_active"?: boolean,"name": string,"priority"?: number,"updated_at"?: string
                  }
                  Update: {
                    "code"?: string,"created_at"?: string,"description"?: string | null,"id"?: string,"is_active"?: boolean,"name"?: string,"priority"?: number,"updated_at"?: string
                  }
                  Relationships: [
                    
                  ]
                },"site_settings": {
                  Row: {
                    "created_at": string,"description": string | null,"id": string,"is_public": boolean,"setting_key": string,"setting_value": NonNullable<Json>,"updated_at": string,"updated_by": string | null
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string,"description"?: string | null,"id"?: string,"is_public"?: boolean,"setting_key": string,"setting_value": NonNullable<Json>,"updated_at"?: string,"updated_by"?: string | null
                  }
                  Update: {
                    "created_at"?: string,"description"?: string | null,"id"?: string,"is_public"?: boolean,"setting_key"?: string,"setting_value"?: NonNullable<Json>,"updated_at"?: string,"updated_by"?: string | null
                  }
                  Relationships: [
                    
                  ]
                },"size_guide_measurements": {
                  Row: {
                    "id": string,"label": string,"measurement_code": string,"size_guide_row_id": string,"sort_order": number,"unit": string,"value": number
                  }
                  ComputedFields: never
                  Insert: {
                    "id"?: string,"label": string,"measurement_code": string,"size_guide_row_id": string,"sort_order"?: number,"unit": string,"value": number
                  }
                  Update: {
                    "id"?: string,"label"?: string,"measurement_code"?: string,"size_guide_row_id"?: string,"sort_order"?: number,"unit"?: string,"value"?: number
                  }
                  Relationships: [
                    {
      foreignKeyName: "size_guide_measurements_size_guide_row_id_fkey"
      columns: ["size_guide_row_id"]
isOneToOne: false
      referencedRelation: "size_guide_rows"
      referencedColumns: ["id"]
    }
                  ]
                },"size_guide_rows": {
                  Row: {
                    "fit_note": string | null,"id": string,"size_guide_id": string,"size_label": string,"sort_order": number
                  }
                  ComputedFields: never
                  Insert: {
                    "fit_note"?: string | null,"id"?: string,"size_guide_id": string,"size_label": string,"sort_order"?: number
                  }
                  Update: {
                    "fit_note"?: string | null,"id"?: string,"size_guide_id"?: string,"size_label"?: string,"sort_order"?: number
                  }
                  Relationships: [
                    {
      foreignKeyName: "size_guide_rows_size_guide_id_fkey"
      columns: ["size_guide_id"]
isOneToOne: false
      referencedRelation: "size_guides"
      referencedColumns: ["id"]
    }
                  ]
                },"size_guides": {
                  Row: {
                    "created_at": string,"description": string | null,"id": string,"measurement_unit": string,"name": string,"slug": string,"status": string,"updated_at": string
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string,"description"?: string | null,"id"?: string,"measurement_unit"?: string,"name": string,"slug": string,"status"?: string,"updated_at"?: string
                  }
                  Update: {
                    "created_at"?: string,"description"?: string | null,"id"?: string,"measurement_unit"?: string,"name"?: string,"slug"?: string,"status"?: string,"updated_at"?: string
                  }
                  Relationships: [
                    
                  ]
                },"staff_profiles": {
                  Row: {
                    "created_at": string,"created_by": string | null,"display_name": string,"id": string,"last_active_at": string | null,"mfa_enforced": boolean,"staff_status": string,"updated_at": string
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string,"created_by"?: string | null,"display_name": string,"id": string,"last_active_at"?: string | null,"mfa_enforced"?: boolean,"staff_status"?: string,"updated_at"?: string
                  }
                  Update: {
                    "created_at"?: string,"created_by"?: string | null,"display_name"?: string,"id"?: string,"last_active_at"?: string | null,"mfa_enforced"?: boolean,"staff_status"?: string,"updated_at"?: string
                  }
                  Relationships: [
                    
                  ]
                },"staff_role_assignments": {
                  Row: {
                    "assigned_at": string,"assigned_by": string | null,"id": string,"revoked_at": string | null,"revoked_by": string | null,"role_id": string,"staff_user_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "assigned_at"?: string,"assigned_by"?: string | null,"id"?: string,"revoked_at"?: string | null,"revoked_by"?: string | null,"role_id": string,"staff_user_id": string
                  }
                  Update: {
                    "assigned_at"?: string,"assigned_by"?: string | null,"id"?: string,"revoked_at"?: string | null,"revoked_by"?: string | null,"role_id"?: string,"staff_user_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "staff_role_assignments_role_id_fkey"
      columns: ["role_id"]
isOneToOne: false
      referencedRelation: "roles"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "staff_role_assignments_staff_user_id_fkey"
      columns: ["staff_user_id"]
isOneToOne: false
      referencedRelation: "staff_profiles"
      referencedColumns: ["id"]
    }
                  ]
                },"stock_reservation_items": {
                  Row: {
                    "created_at": string,"id": string,"location_id": string,"order_item_id": string,"quantity": number,"reservation_id": string,"variant_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string,"id"?: string,"location_id": string,"order_item_id": string,"quantity": number,"reservation_id": string,"variant_id": string
                  }
                  Update: {
                    "created_at"?: string,"id"?: string,"location_id"?: string,"order_item_id"?: string,"quantity"?: number,"reservation_id"?: string,"variant_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "reservation_item_level_fk"
      columns: ["variant_id","location_id"]
isOneToOne: false
      referencedRelation: "inventory_levels"
      referencedColumns: ["variant_id","location_id"]
    },{
      foreignKeyName: "reservation_item_level_fk"
      columns: ["variant_id","location_id"]
isOneToOne: false
      referencedRelation: "v_inventory_availability"
      referencedColumns: ["variant_id","location_id"]
    },{
      foreignKeyName: "stock_reservation_items_location_id_fkey"
      columns: ["location_id"]
isOneToOne: false
      referencedRelation: "inventory_locations"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "stock_reservation_items_order_item_id_variant_id_fkey"
      columns: ["order_item_id","variant_id"]
isOneToOne: false
      referencedRelation: "order_items"
      referencedColumns: ["id","variant_id"]
    },{
      foreignKeyName: "stock_reservation_items_reservation_id_fkey"
      columns: ["reservation_id"]
isOneToOne: false
      referencedRelation: "stock_reservations"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "stock_reservation_items_variant_id_fkey"
      columns: ["variant_id"]
isOneToOne: false
      referencedRelation: "product_variants"
      referencedColumns: ["id"]
    }
                  ]
                },"stock_reservations": {
                  Row: {
                    "committed_at": string | null,"created_at": string,"expired_at": string | null,"expires_at": string,"id": string,"idempotency_key": string,"order_id": string,"release_reason": string | null,"released_at": string | null,"status": string,"updated_at": string
                  }
                  ComputedFields: never
                  Insert: {
                    "committed_at"?: string | null,"created_at"?: string,"expired_at"?: string | null,"expires_at": string,"id"?: string,"idempotency_key": string,"order_id": string,"release_reason"?: string | null,"released_at"?: string | null,"status": string,"updated_at"?: string
                  }
                  Update: {
                    "committed_at"?: string | null,"created_at"?: string,"expired_at"?: string | null,"expires_at"?: string,"id"?: string,"idempotency_key"?: string,"order_id"?: string,"release_reason"?: string | null,"released_at"?: string | null,"status"?: string,"updated_at"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "stock_reservations_order_id_fkey"
      columns: ["order_id"]
isOneToOne: false
      referencedRelation: "orders"
      referencedColumns: ["id"]
    }
                  ]
                },"wards": {
                  Row: {
                    "created_at": string,"id": string,"is_active": boolean,"municipality_id": string,"name_en": string | null,"name_ne": string | null,"updated_at": string,"ward_number": number
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string,"id"?: string,"is_active"?: boolean,"municipality_id": string,"name_en"?: string | null,"name_ne"?: string | null,"updated_at"?: string,"ward_number": number
                  }
                  Update: {
                    "created_at"?: string,"id"?: string,"is_active"?: boolean,"municipality_id"?: string,"name_en"?: string | null,"name_ne"?: string | null,"updated_at"?: string,"ward_number"?: number
                  }
                  Relationships: [
                    {
      foreignKeyName: "wards_municipality_id_fkey"
      columns: ["municipality_id"]
isOneToOne: false
      referencedRelation: "municipalities"
      referencedColumns: ["id"]
    }
                  ]
                },"webhook_events": {
                  Row: {
                    "attempt_count": number,"created_at": string,"event_type": string,"id": string,"last_error_safe": string | null,"payload_sanitized": NonNullable<Json>,"processed_at": string | null,"provider_event_id": string,"provider_id": string,"received_at": string,"request_id": string | null,"signature_verified": boolean,"status": string
                  }
                  ComputedFields: never
                  Insert: {
                    "attempt_count"?: number,"created_at"?: string,"event_type": string,"id"?: string,"last_error_safe"?: string | null,"payload_sanitized"?: NonNullable<Json>,"processed_at"?: string | null,"provider_event_id": string,"provider_id": string,"received_at"?: string,"request_id"?: string | null,"signature_verified"?: boolean,"status"?: string
                  }
                  Update: {
                    "attempt_count"?: number,"created_at"?: string,"event_type"?: string,"id"?: string,"last_error_safe"?: string | null,"payload_sanitized"?: NonNullable<Json>,"processed_at"?: string | null,"provider_event_id"?: string,"provider_id"?: string,"received_at"?: string,"request_id"?: string | null,"signature_verified"?: boolean,"status"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "webhook_events_provider_id_fkey"
      columns: ["provider_id"]
isOneToOne: false
      referencedRelation: "integration_providers"
      referencedColumns: ["id"]
    }
                  ]
                },"wishlist_items": {
                  Row: {
                    "created_at": string,"id": string,"product_id": string,"variant_id": string | null,"wishlist_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string,"id"?: string,"product_id": string,"variant_id"?: string | null,"wishlist_id": string
                  }
                  Update: {
                    "created_at"?: string,"id"?: string,"product_id"?: string,"variant_id"?: string | null,"wishlist_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "wishlist_items_product_id_fkey"
      columns: ["product_id"]
isOneToOne: false
      referencedRelation: "products"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "wishlist_items_variant_id_fkey"
      columns: ["variant_id"]
isOneToOne: false
      referencedRelation: "product_variants"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "wishlist_items_wishlist_id_fkey"
      columns: ["wishlist_id"]
isOneToOne: false
      referencedRelation: "wishlists"
      referencedColumns: ["id"]
    }
                  ]
                },"wishlists": {
                  Row: {
                    "created_at": string,"customer_id": string,"id": string,"updated_at": string
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string,"customer_id": string,"id"?: string,"updated_at"?: string
                  }
                  Update: {
                    "created_at"?: string,"customer_id"?: string,"id"?: string,"updated_at"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "wishlists_customer_id_fkey"
      columns: ["customer_id"]
isOneToOne: true
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    }
                  ]
                }
          }
          Views: {
            "v_inventory_availability": {
                  Row: {
                    "available_quantity": number | null,"inventory_level_id": string,"location_id": string,"on_hand_quantity": number,"reserved_quantity": number | null,"updated_at": string,"variant_id": string
                  }
                  ComputedFields: never
                  Relationships: [
                    {
      foreignKeyName: "inventory_levels_location_id_fkey"
      columns: ["location_id"]
isOneToOne: false
      referencedRelation: "inventory_locations"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "inventory_levels_variant_id_fkey"
      columns: ["variant_id"]
isOneToOne: false
      referencedRelation: "product_variants"
      referencedColumns: ["id"]
    }
                  ]
                },"v_public_product_reviews": {
                  Row: {
                    "body": string | null,"created_at": string,"id": string,"product_id": string,"rating": number,"title": string | null,"verified_purchase": boolean
                  }
                  ComputedFields: never
                  Insert: {
                           "body"?: string | null,"created_at"?: string | null,"id"?: string | null,"product_id"?: string | null,"rating"?: number | null,"title"?: string | null,"verified_purchase"?: boolean | null
                         }
                        Update: {
                           "body"?: string | null,"created_at"?: string | null,"id"?: string | null,"product_id"?: string | null,"rating"?: number | null,"title"?: string | null,"verified_purchase"?: boolean | null
                         }
                        Relationships: [
                    {
      foreignKeyName: "reviews_product_id_fkey"
      columns: ["product_id"]
isOneToOne: false
      referencedRelation: "products"
      referencedColumns: ["id"]
    }
                  ]
                }
          }
          Functions: {
            "commit_stock_reservation":
{ Args: { "p_reservation_id": string }; Returns: undefined
                           },
"create_checkout_order":
{ Args: { "p_billing_address_snapshot": Json,"p_customer_id": string,"p_customer_note"?: string,"p_delivery_address_snapshot": Json,"p_guest_email": string,"p_guest_name": string,"p_guest_phone_e164": string,"p_idempotency_key": string,"p_items": Json,"p_location_id": string,"p_payment_method_code": string,"p_request_hash": string,"p_reservation_expires_at": string,"p_shipping_fee": number,"p_shipping_rule_snapshot": Json,"p_shipping_zone_id": string }; Returns: string
                           },
"decide_manual_payment":
{ Args: { "p_decision": string,"p_payment_id": string,"p_reason": string }; Returns: undefined
                           },
"expire_due_reservations":
{ Args: { "p_batch_size"?: number }; Returns: number
                           },
"post_inventory_adjustment":
{ Args: { "p_location_id": string,"p_quantity_delta": number,"p_reason": string,"p_reason_code": string,"p_variant_id": string }; Returns: string
                           },
"record_cod_collection":
{ Args: { "p_collected_amount": number,"p_payment_id": string,"p_reference"?: string }; Returns: undefined
                           },
"release_stock_reservation":
{ Args: { "p_reason": string,"p_reservation_id": string }; Returns: undefined
                           },
"submit_manual_esewa_payment":
{ Args: { "p_customer_reference": string,"p_guest_challenge_verified"?: boolean,"p_idempotency_key": string,"p_new_reservation_expires_at": string,"p_payment_id": string,"p_verified_customer_id"?: string }; Returns: string
                           },
"transition_order":
{ Args: { "p_order_id": string,"p_reason"?: string,"p_request_id"?: string,"p_target_status": string }; Returns: undefined
                           }
          }
          Enums: {
            [_ in never]: never
          }
          CompositeTypes: {
            [_ in never]: never
          }
        }
}

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
  ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
      Row: infer R
    }
    ? R
    : never
  : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
  ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
      Insert: infer I
    }
    ? I
    : never
  : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
  ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
      Update: infer U
    }
    ? U
    : never
  : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
  ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
  : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never
> = PublicCompositeTypeNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
  ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
  : never

export const Constants = {
  "public": {
          Enums: {
            
          }
        }
} as const
